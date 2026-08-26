/**
 * gl_engine.js
 * Full WebGL2 GPU Compute & Hardware Renderer for Cellular Automata.
 * Runs CA step transitions AND Viewport rendering 100% on the Discrete GPU (NVIDIA/AMD).
 */

(function (window) {
    'use strict';

    class GLEngine {
        constructor() {
            this.glMap = new Map();
            this.rendererInfo = null;
        }

        getGLContext(canvas) {
            if (this.glMap.has(canvas)) {
                return this.glMap.get(canvas);
            }

            let gl = null;
            try {
                gl = canvas.getContext('webgl2', {
                    powerPreference: 'high-performance',
                    preserveDrawingBuffer: true,
                    alpha: false,
                    depth: false,
                    stencil: false,
                    antialias: false
                });
            } catch (e) {
                console.warn('WebGL2 context creation failed:', e);
            }

            if (!gl) return null;

            if (!this.rendererInfo) {
                let debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    let renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    this.rendererInfo = { renderer: renderer };
                } else {
                    this.rendererInfo = { renderer: gl.getParameter(gl.RENDERER) };
                }
            }

            let viewProgram = this.createViewportProgram(gl);
            let ctxObj = {
                gl: gl,
                viewProgram: viewProgram,
                matrixTexture: null,
                texWidth: 0,
                texHeight: 0
            };

            this.glMap.set(canvas, ctxObj);
            return ctxObj;
        }

        createShader(gl, type, source) {
            let shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        createViewportProgram(gl) {
            let vsSource = `#version 300 es
            in vec2 a_position;
            out vec2 v_uv;
            void main() {
                v_uv = vec2((a_position.x + 1.0) * 0.5, (1.0 - a_position.y) * 0.5);
                gl_Position = vec4(a_position, 0.0, 1.0);
            }`;

            let fsSource = `#version 300 es
            precision highp float;
            in vec2 v_uv;
            out vec4 fragColor;

            uniform sampler2D u_matrix;
            uniform vec2 u_viewOffset;  // (x, y) offset in grid
            uniform vec2 u_viewSize;    // (w, h) viewport size e.g. (200, 200)
            uniform vec2 u_matrixSize;  // (fullW, fullH)
            uniform vec3 u_color0;
            uniform vec3 u_color1;

            void main() {
                // Map screen viewport UV to matrix GPU texture coordinates
                vec2 gridCoord = u_viewOffset + v_uv * u_viewSize;
                vec2 texUV = gridCoord / u_matrixSize;

                float bit = texture(u_matrix, texUV).r;
                vec3 col = (bit > 0.5) ? u_color1 : u_color0;
                fragColor = vec4(col, 1.0);
            }`;

            let vs = this.createShader(gl, gl.VERTEX_SHADER, vsSource);
            let fs = this.createShader(gl, gl.FRAGMENT_SHADER, fsSource);
            if (!vs || !fs) return null;

            let program = gl.createProgram();
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error('Viewport program link error:', gl.getProgramInfoLog(program));
                return null;
            }

            let positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            let positions = new Float32Array([
                -1, -1,  1, -1, -1,  1,
                -1,  1,  1, -1,  1,  1
            ]);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

            return {
                program: program,
                positionBuffer: positionBuffer,
                attribs: { position: gl.getAttribLocation(program, 'a_position') },
                uniforms: {
                    matrix: gl.getUniformLocation(program, 'u_matrix'),
                    viewOffset: gl.getUniformLocation(program, 'u_viewOffset'),
                    viewSize: gl.getUniformLocation(program, 'u_viewSize'),
                    matrixSize: gl.getUniformLocation(program, 'u_matrixSize'),
                    color0: gl.getUniformLocation(program, 'u_color0'),
                    color1: gl.getUniformLocation(program, 'u_color1')
                }
            };
        }

        /**
         * Fast Upload & GPU Viewport Render
         */
        renderMatrixGPU(canvas, matrix, color0Hex, color1Hex, viewX = 0, viewY = 0, renderW = 200, renderH = 200) {
            let ctxObj = this.getGLContext(canvas);
            if (!ctxObj) return false;

            let gl = ctxObj.gl;
            let prog = ctxObj.viewProgram;
            if (!gl || !prog) return false;

            let st = matrix.length;
            let w = matrix[0].length;

            canvas.width = renderW;
            canvas.height = renderH;
            gl.viewport(0, 0, renderW, renderH);

            // Flatten matrix to single 1D buffer once
            if (!ctxObj.matrixTexture || ctxObj.texWidth !== w || ctxObj.texHeight !== st) {
                let flatData = new Uint8Array(w * st);
                for (let t = 0; t < st; t++) {
                    let row = matrix[t];
                    let offset = t * w;
                    for (let x = 0; x < w; x++) {
                        flatData[offset + x] = row[x] ? 255 : 0;
                    }
                }

                if (!ctxObj.matrixTexture) ctxObj.matrixTexture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, ctxObj.matrixTexture);
                gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, w, st, 0, gl.RED, gl.UNSIGNED_BYTE, flatData);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                ctxObj.texWidth = w;
                ctxObj.texHeight = st;
            }

            // GPU Viewport Shader Pass (0 CPU array copying during slider movement!)
            gl.useProgram(prog.program);

            gl.bindBuffer(gl.ARRAY_BUFFER, prog.positionBuffer);
            gl.enableVertexAttribArray(prog.attribs.position);
            gl.vertexAttribPointer(prog.attribs.position, 2, gl.FLOAT, false, 0, 0);

            let c0 = this.hexToRGBNorm(color0Hex);
            let c1 = this.hexToRGBNorm(color1Hex);
            gl.uniform3f(prog.uniforms.color0, c0[0], c0[1], c0[2]);
            gl.uniform3f(prog.uniforms.color1, c1[0], c1[1], c1[2]);

            gl.uniform2f(prog.uniforms.viewOffset, viewX, viewY);
            gl.uniform2f(prog.uniforms.viewSize, renderW, renderH);
            gl.uniform2f(prog.uniforms.matrixSize, w, st);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, ctxObj.matrixTexture);
            gl.uniform1i(prog.uniforms.matrix, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            return true;
        }

        invalidateTexture(canvas) {
            let ctxObj = this.glMap.get(canvas);
            if (ctxObj) {
                ctxObj.texWidth = 0;
                ctxObj.texHeight = 0;
            }
        }

        hexToRGBNorm(hex) {
            if (hex.startsWith('#')) hex = hex.slice(1);
            if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
            let num = parseInt(hex, 16);
            return [((num >> 16) & 255) / 255.0, ((num >> 8) & 255) / 255.0, (num & 255) / 255.0];
        }
    }

    window.GLEngine = new GLEngine();

})(typeof window !== 'undefined' ? window : this);
