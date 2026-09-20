import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX, createFragment } from './common.js';

/**
 * Grayscale.
 * amount: 0 = original, 1 = full grayscale
 */
export const grayscale = new ShaderEffect({
  name: 'grayscale',
  uniforms: {
    amount: 0
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: createFragment(/* glsl */ `
    float luma = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    color.rgb = mix(color.rgb, vec3(luma), amount);
  `, 'uniform float amount;')
});

export default grayscale;
