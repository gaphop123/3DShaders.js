import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX } from './common.js';

/**
 * Separable Gaussian blur (horizontal or vertical pass).
 * Use two passes (h then v) for a proper 2D blur.
 *
 * uniforms:
 *   radius   - blur radius in pixels (approx)
 *   direction - vec2(1,0) or vec2(0,1)
 *   resolution - vec2(width, height)
 */
export const blur = new ShaderEffect({
  name: 'blur',
  uniforms: {
    radius: 0,
    direction: [1, 0],
    resolution: [1, 1]
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: /* glsl */ `
uniform sampler2D tDiffuse;
uniform float radius;
uniform vec2 direction;
uniform vec2 resolution;
varying vec2 vUv;

void main() {
  vec2 texel = 1.0 / resolution;
  vec2 off = direction * texel * radius;

  // 9-tap Gaussian approximation
  vec4 color = texture2D(tDiffuse, vUv) * 0.227027;
  color += texture2D(tDiffuse, vUv + off * 1.384615) * 0.316216;
  color += texture2D(tDiffuse, vUv - off * 1.384615) * 0.316216;
  color += texture2D(tDiffuse, vUv + off * 3.230769) * 0.070270;
  color += texture2D(tDiffuse, vUv - off * 3.230769) * 0.070270;

  gl_FragColor = color;
}
`,
  isActive: (u) => Math.abs(u.radius) > 0.01
});

export default blur;
