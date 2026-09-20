import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX } from './common.js';

/**
 * Simple procedural noise overlay.
 * amount: noise strength
 * time: optional animation
 */
export const noise = new ShaderEffect({
  name: 'noise',
  uniforms: {
    amount: 0,
    time: 0
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: /* glsl */ `
uniform sampler2D tDiffuse;
uniform float amount;
uniform float time;
varying vec2 vUv;

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  float n = rand(vUv + time) * 2.0 - 1.0;
  color.rgb += n * amount;
  gl_FragColor = color;
}
`,
  isActive: (u) => Math.abs(u.amount) > 1e-6
});

export default noise;
