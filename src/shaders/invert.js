import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX, createFragment } from './common.js';

/**
 * Color invert.
 * amount: 0 = original, 1 = fully inverted
 */
export const invert = new ShaderEffect({
  name: 'invert',
  uniforms: {
    amount: 0
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: createFragment(/* glsl */ `
    color.rgb = mix(color.rgb, 1.0 - color.rgb, amount);
  `, 'uniform float amount;')
});

export default invert;
