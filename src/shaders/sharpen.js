import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX } from './common.js';

/**
 * Unsharp-mask style sharpen.
 * amount: strength of sharpening
 * resolution: needed for texel size
 */
export const sharpen = new ShaderEffect({
  name: 'sharpen',
  uniforms: {
    amount: 0,
    resolution: [1, 1]
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: /* glsl */ `
uniform sampler2D tDiffuse;
uniform float amount;
uniform vec2 resolution;
varying vec2 vUv;

void main() {
  vec2 texel = 1.0 / resolution;
  vec4 center = texture2D(tDiffuse, vUv);
  vec4 up     = texture2D(tDiffuse, vUv + vec2(0.0,  texel.y));
  vec4 down   = texture2D(tDiffuse, vUv - vec2(0.0,  texel.y));
  vec4 left   = texture2D(tDiffuse, vUv - vec2(texel.x, 0.0));
  vec4 right  = texture2D(tDiffuse, vUv + vec2(texel.x, 0.0));

  vec4 edge = (up + down + left + right) * 0.25;
  gl_FragColor = center + (center - edge) * amount;
}
`,
  isActive: (u) => Math.abs(u.amount) > 0.001
});

export default sharpen;
