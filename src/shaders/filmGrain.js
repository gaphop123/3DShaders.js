import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX } from './common.js';

/**
 * Film grain (animated noise with slight luminance bias).
 * amount: grain strength
 * time: animation driver
 */
export const filmGrain = new ShaderEffect({
  name: 'filmGrain',
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
  return fract(sin(dot(co.xy + time, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  float grain = rand(vUv) * 2.0 - 1.0;
  // Slightly more grain in darker areas
  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  color.rgb += grain * amount * (1.0 - luma * 0.5);
  gl_FragColor = color;
}
`,
  isActive: (u) => Math.abs(u.amount) > 1e-6
});

export default filmGrain;
