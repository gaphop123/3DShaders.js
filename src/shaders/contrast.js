import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX, createFragment } from './common.js';

/**
 * Contrast adjustment.
 * amount: 0 = gray, 1 = original, >1 increases contrast
 */
export const contrast = new ShaderEffect({
  name: 'contrast',
  uniforms: {
    amount: 1
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: createFragment(/* glsl */ `
    color.rgb = (color.rgb - 0.5) * amount + 0.5;
  `, 'uniform float amount;')
});

export default contrast;
