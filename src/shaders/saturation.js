import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX, createFragment } from './common.js';

/**
 * Saturation adjustment.
 * amount: 0 = grayscale, 1 = original, >1 more saturated
 */
export const saturation = new ShaderEffect({
  name: 'saturation',
  uniforms: {
    amount: 1
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: createFragment(/* glsl */ `
    float luma = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    color.rgb = mix(vec3(luma), color.rgb, amount);
  `, 'uniform float amount;')
});

export default saturation;
