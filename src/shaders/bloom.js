import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX } from './common.js';

/**
 * Simple threshold + soft bloom contribution.
 * For a full bloom, combine with blur passes externally.
 *
 * intensity: bloom strength
 * threshold: luminance threshold
 * radius: soft knee radius around threshold
 */
export const bloom = new ShaderEffect({
  name: 'bloom',
  uniforms: {
    intensity: 0,
    threshold: 0.8,
    radius: 0.2
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: /* glsl */ `
uniform sampler2D tDiffuse;
uniform float intensity;
uniform float threshold;
uniform float radius;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  float luma = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));

  // Soft threshold (knee)
  float soft = clamp((luma - threshold + radius) / (2.0 * radius), 0.0, 1.0);
  float contrib = soft * soft * (3.0 - 2.0 * soft); // smoothstep approx
  contrib = max(contrib, step(threshold, luma));

  vec3 bloomColor = color.rgb * contrib * intensity;
  gl_FragColor = vec4(color.rgb + bloomColor, color.a);
}
`,
  isActive: (u) => Math.abs(u.intensity) > 0.001
});

export default bloom;
