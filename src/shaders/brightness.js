import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX, createFragment } from './common.js';

/**
 * Brightness adjustment.
 * amount: -1 to 1 (0 = no change)
 */
export const brightness = new ShaderEffect({
  name: 'brightness',
  uniforms: {
    amount: 0
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: createFragment(/* glsl */ `
    color.rgb += amount;
  `, 'uniform float amount;')
});

export default brightness;
