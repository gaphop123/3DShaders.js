import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX, createFragment } from './common.js';

/**
 * Simple color fog / atmospheric haze.
 * density: fog density
 * color: fog color (vec3)
 */
export const fog = new ShaderEffect({
  name: 'fog',
  uniforms: {
    density: 0,
    color: [0.8, 0.85, 0.9]
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: createFragment(/* glsl */ `
    float factor = 1.0 - exp(-density * 5.0);
    color.rgb = mix(color.rgb, fogColor, clamp(factor, 0.0, 1.0));
  `, `
uniform float density;
uniform vec3 fogColor;
`)
});

export default fog;
