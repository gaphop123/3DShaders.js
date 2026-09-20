import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX, createFragment } from './common.js';

/**
 * Gamma correction.
 * amount: typical 2.2
 */
export const gamma = new ShaderEffect({
  name: 'gamma',
  uniforms: {
    amount: 1
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: createFragment(/* glsl */ `
    color.rgb = pow(max(color.rgb, 0.0), vec3(1.0 / max(amount, 0.001)));
  `, 'uniform float amount;')
});

export default gamma;
