export { brightness } from './brightness.js';
export { contrast } from './contrast.js';
export { saturation } from './saturation.js';
export { grayscale } from './grayscale.js';
export { invert } from './invert.js';
export { blur } from './blur.js';
export { sharpen } from './sharpen.js';
export { vignette } from './vignette.js';
export { bloom } from './bloom.js';
export { chromaticAberration } from './chromaticAberration.js';
export { colorTemperature } from './colorTemperature.js';
export { exposure } from './exposure.js';
export { gamma } from './gamma.js';
export { noise } from './noise.js';
export { filmGrain } from './filmGrain.js';
export { pixelate } from './pixelate.js';
export { fog } from './fog.js';

import { brightness } from './brightness.js';
import { contrast } from './contrast.js';
import { saturation } from './saturation.js';
import { grayscale } from './grayscale.js';
import { invert } from './invert.js';
import { blur } from './blur.js';
import { sharpen } from './sharpen.js';
import { vignette } from './vignette.js';
import { bloom } from './bloom.js';
import { chromaticAberration } from './chromaticAberration.js';
import { colorTemperature } from './colorTemperature.js';
import { exposure } from './exposure.js';
import { gamma } from './gamma.js';
import { noise } from './noise.js';
import { filmGrain } from './filmGrain.js';
import { pixelate } from './pixelate.js';
import { fog } from './fog.js';

/**
 * All built-in effects as a map.
 */
export const shaders = {
  brightness,
  contrast,
  saturation,
  grayscale,
  invert,
  blur,
  sharpen,
  vignette,
  bloom,
  chromaticAberration,
  colorTemperature,
  exposure,
  gamma,
  noise,
  filmGrain,
  pixelate,
  fog
};

/**
 * Ready-made visual style presets.
 * Each returns a plain object of effect settings that can be fed to setMany().
 */
export const presets = {
  cinematic() {
    return {
      contrast: 1.25,
      saturation: 0.9,
      vignette: { intensity: 0.45, softness: 0.6 },
      colorTemperature: { temperature: 5800 },
      exposure: 1.05
    };
  },

  vintage() {
    return {
      saturation: 0.7,
      contrast: 1.15,
      colorTemperature: { temperature: 4500 },
      vignette: { intensity: 0.55, softness: 0.4 },
      filmGrain: { amount: 0.08 }
    };
  },

  noir() {
    return {
      grayscale: 1,
      contrast: 1.4,
      vignette: { intensity: 0.7, softness: 0.5 },
      filmGrain: { amount: 0.12 }
    };
  },

  cold() {
    return {
      colorTemperature: { temperature: 9000 },
      saturation: 0.85,
      contrast: 1.1
    };
  },

  warm() {
    return {
      colorTemperature: { temperature: 4000 },
      saturation: 1.15,
      exposure: 1.08
    };
  },

  retro() {
    return {
      saturation: 1.3,
      contrast: 1.2,
      chromaticAberration: { amount: 0.004 },
      pixelate: { size: 2 },
      filmGrain: { amount: 0.06 }
    };
  },

  dream() {
    return {
      blur: { radius: 1.5 },
      saturation: 1.2,
      bloom: { intensity: 0.6, threshold: 0.6, radius: 0.3 },
      vignette: { intensity: 0.3, softness: 0.7 }
    };
  }
};

export default shaders;
