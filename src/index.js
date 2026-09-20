/**
 * 3DShaders.js – Modern shader & post-processing library for Web 3D.
 * Supports Three.js and Babylon.js as peer dependencies.
 */

export { ShaderEffect } from './core/ShaderEffect.js';
export { ShaderController } from './core/ShaderController.js';
export { ShaderPipeline } from './core/ShaderPipeline.js';

export {
  shaders,
  presets,
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
} from './shaders/index.js';

import { ShaderController } from './core/ShaderController.js';
import { shaders } from './shaders/index.js';

/**
 * Create a ShaderController pre-loaded with all built-in effects.
 * @returns {ShaderController}
 */
export function createController() {
  const controller = new ShaderController();
  for (const [name, effect] of Object.entries(shaders)) {
    controller.register(name, effect);
  }
  return controller;
}

/**
 * Convenience default export – a ready-to-use controller.
 */
const defaultController = createController();
export default defaultController;
