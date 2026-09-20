import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX } from './common.js';

/**
 * Chromatic aberration (RGB channel offset).
 * amount: offset strength
 */
export const chromaticAberration = new ShaderEffect({
  name: 'chromaticAberration',
  uniforms: {
    amount: 0
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: /* glsl */ `
uniform sampler2D tDiffuse;
uniform float amount;
varying vec2 vUv;

void main() {
  vec2 dir = vUv - 0.5;
  float r = texture2D(tDiffuse, vUv + dir * amount).r;
  float g = texture2D(tDiffuse, vUv).g;
  float b = texture2D(tDiffuse, vUv - dir * amount).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}
`,
  isActive: (u) => Math.abs(u.amount) > 1e-6
});

export default chromaticAberration;
