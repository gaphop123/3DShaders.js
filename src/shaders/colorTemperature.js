import { ShaderEffect } from '../core/ShaderEffect.js';
import { DEFAULT_VERTEX, createFragment } from './common.js';

/**
 * Color temperature adjustment (Kelvin approximation).
 * temperature: Kelvin value (default ~6500)
 */
export const colorTemperature = new ShaderEffect({
  name: 'colorTemperature',
  uniforms: {
    temperature: 6500
  },
  vertexShader: DEFAULT_VERTEX,
  fragmentShader: createFragment(/* glsl */ `
    // Approximate black-body to RGB
    float t = clamp(temperature, 1000.0, 40000.0) / 100.0;
    vec3 tempColor;
    if (t <= 66.0) {
      tempColor.r = 1.0;
      tempColor.g = clamp(0.3900815787690196 * log(t) - 0.6318414437886275, 0.0, 1.0);
    } else {
      float tc = t - 60.0;
      tempColor.r = clamp(1.292936186062745 * pow(tc, -0.1332047592), 0.0, 1.0);
      tempColor.g = clamp(1.129890860895554 * pow(tc, -0.0755148492), 0.0, 1.0);
    }
    if (t >= 66.0) {
      tempColor.b = 1.0;
    } else if (t <= 19.0) {
      tempColor.b = 0.0;
    } else {
      tempColor.b = clamp(0.543206789110196 * log(t - 10.0) - 1.19625408914, 0.0, 1.0);
    }
    // Blend towards the temperature color
    float factor = (temperature - 6500.0) / 6500.0;
    color.rgb = mix(color.rgb, color.rgb * tempColor, clamp(abs(factor), 0.0, 1.0));
  `, 'uniform float temperature;')
});

export default colorTemperature;
