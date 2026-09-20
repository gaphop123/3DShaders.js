/**
 * Helper to create a Babylon Effect from a 3DShaders definition.
 */

import { shaders as builtInShaders } from '../shaders/index.js';

/**
 * Create a BABYLON.Effect from a registered 3DShaders effect name.
 * Useful for custom materials.
 *
 * @param {Object} engine - BABYLON.Engine
 * @param {string} name - effect name
 * @param {Object} [options]
 * @param {Object} [options.BABYLON]
 * @param {Object} [options.params] - initial uniform values
 * @returns {Object} BABYLON.Effect
 */
export function createBabylonEffect(engine, name, options = {}) {
  const BABYLON = options.BABYLON || (typeof window !== 'undefined' ? window.BABYLON : null);
  if (!BABYLON) {
    throw new Error('createBabylonEffect: BABYLON namespace is required');
  }

  const def = builtInShaders[name];
  if (!def) {
    throw new Error(`createBabylonEffect: unknown effect "${name}"`);
  }

  const uniforms = Object.keys(def.uniforms);
  const attributes = ['position', 'uv'];

  const vertex = def.vertexShader || /* glsl */ `
    attribute vec3 position;
    attribute vec2 uv;
    varying vec2 vUV;
    void main() {
      vUV = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragment = def.fragmentShader
    .replace(/tDiffuse/g, 'textureSampler')
    .replace(/vUv/g, 'vUV');

  const effect = new BABYLON.Effect(
    name,
    attributes,
    uniforms.concat(['textureSampler']),
    [],
    engine,
    null,
    null,
    {
      vertexSource: vertex,
      fragmentSource: fragment
    }
  );

  return effect;
}

export class BabylonShaderEffect {
  /**
   * @param {Object} engine
   * @param {string} name
   * @param {Object} [options]
   */
  constructor(engine, name, options = {}) {
    this.effect = createBabylonEffect(engine, name, options);
    this.name = name;
  }

  dispose() {
    // Effects are managed by the engine; no explicit dispose needed in most cases
  }
}

export default BabylonShaderEffect;
