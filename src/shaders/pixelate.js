import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX } from './common.js';

/**
 * Pixelation effect.
 * size: pixel block size in pixels
 * resolution: render target size
 */
export const pixelate = new ShaderEffect({
  name: 'pixelate',
  uniforms: {
    size: 1,
    resolution: [1, 1]
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: /* glsl */ `
uniform sampler2D tDiffuse;
uniform float size;
uniform vec2 resolution;
varying vec2 vUv;

void main() {
  vec2 pixelSize = size / resolution;
  vec2 uv = floor(vUv / pixelSize) * pixelSize + pixelSize * 0.5;
  gl_FragColor = texture2D(tDiffuse, uv);
}
`,
  isActive: (u) => u.size > 1.01
});

export default pixelate;
