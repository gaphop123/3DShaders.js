import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX, createFragment } from './common.js';

/**
 * Exposure adjustment (multiplicative).
 * amount: 1 = original, >1 brighter, <1 darker
 */
export const exposure = new ShaderEffect({
  name: 'exposure',
  uniforms: {
    amount: 1
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: createFragment(/* glsl */ `
    color.rgb *= amount;
  `, 'uniform float amount;')
});

export default exposure;
