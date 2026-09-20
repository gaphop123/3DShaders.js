import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX, createFragment } from './common.js';

/**
 * Vignette (darken edges).
 * intensity: strength of darkening
 * softness: falloff softness (0-1)
 */
export const vignette = new ShaderEffect({
  name: 'vignette',
  uniforms: {
    intensity: 0,
    softness: 0.5
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: createFragment(/* glsl */ `
    vec2 uv = vUv * 2.0 - 1.0;
    float dist = length(uv);
    float vig = smoothstep(0.8, softness * 0.8, dist);
    color.rgb *= 1.0 - intensity * vig;
  `, `
uniform float intensity;
uniform float softness;
`)
});

export default vignette;
