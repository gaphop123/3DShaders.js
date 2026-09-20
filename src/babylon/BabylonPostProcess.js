/**
 * Babylon.js PostProcess wrapper around 3DShaders effects.
 */

import { ShaderController } from '../core/ShaderController.js';
import { shaders as builtInShaders } from '../shaders/index.js';

/**
 * Creates a Babylon PostProcess that applies a single effect,
 * or manages a small chain via the controller.
 */
export class BabylonPostProcess {
  /**
   * @param {Object} camera - BABYLON.Camera
   * @param {Object} [options]
   * @param {Object} [options.BABYLON] - BABYLON namespace
   * @param {string} [options.name='3DShadersPass']
   */
  constructor(camera, options = {}) {
    if (!camera) {
      throw new Error('BabylonPostProcess: camera is required');
    }

    this.camera = camera;
    this.BABYLON = options.BABYLON || (typeof window !== 'undefined' ? window.BABYLON : null);
    if (!this.BABYLON) {
      throw new Error('BabylonPostProcess: BABYLON namespace must be provided via options.BABYLON');
    }

    const BABYLON = this.BABYLON;
    this.name = options.name || '3DShadersPass';

    /** @type {ShaderController} */
    this.controller = new ShaderController();
    for (const [name, effect] of Object.entries(builtInShaders)) {
      this.controller.register(name, effect);
    }

    /** @type {Map<string, BABYLON.PostProcess>} */
    this._passes = new Map();
    this._engine = camera.getEngine();
  }

  /**
   * Set effect parameter.
   * @param {string} name
   * @param {number|Object} value
   * @returns {this}
   */
  set(name, value) {
    this.controller.set(name, value);
    this._updateOrCreatePass(name);
    return this;
  }

  get(name) {
    return this.controller.get(name);
  }

  setMany(map) {
    this.controller.setMany(map);
    for (const name of Object.keys(map)) {
      this._updateOrCreatePass(name);
    }
    return this;
  }

  enable(name) {
    this.controller.enable(name);
    this._updateOrCreatePass(name);
    return this;
  }

  disable(name) {
    this.controller.disable(name);
    const pass = this._passes.get(name);
    if (pass) {
      // Babylon doesn't have a direct disable; we dispose and remove
      pass.dispose();
      this._passes.delete(name);
    }
    return this;
  }

  reset() {
    this.controller.reset();
    for (const pass of this._passes.values()) {
      pass.dispose();
    }
    this._passes.clear();
    return this;
  }

  onChange(cb) {
    return this.controller.onChange(cb);
  }

  /** @private */
  _updateOrCreatePass(name) {
    if (!this.controller.isEnabled(name)) return;

    const effect = this.controller.getEffect(name);
    if (!effect) return;

    const BABYLON = this.BABYLON;
    const settings = this.controller.getSettings()[name];

    // Build uniform declarations for the fragment shader
    const uniformNames = Object.keys(effect.uniforms).filter(k => k !== 'tDiffuse');
    const uniformDecl = uniformNames
      .map(k => {
        const v = effect.uniforms[k];
        if (Array.isArray(v)) return `uniform vec${v.length} ${k};`;
        return `uniform float ${k};`;
      })
      .join('\n');

    // Babylon PostProcess expects a fragment shader that samples textureSampler
    const fragment = /* glsl */ `
#ifdef GL_ES
precision highp float;
#endif
varying vec2 vUV;
uniform sampler2D textureSampler;
${uniformDecl}

${effect.fragmentShader
  .replace(/tDiffuse/g, 'textureSampler')
  .replace(/vUv/g, 'vUV')
  .replace(/varying vec2 vUv;/g, '')
  .replace(/uniform sampler2D tDiffuse;/g, '')}
`;

    // If pass already exists, just update uniforms
    if (this._passes.has(name)) {
      const pass = this._passes.get(name);
      for (const key of uniformNames) {
        const val = settings[key];
        if (val === undefined) continue;
        if (Array.isArray(val)) {
          pass.setArray3(key, val); // simplified – real code should pick correct setArrayN
        } else {
          pass.setFloat(key, val);
        }
      }
      return;
    }

    const pass = new BABYLON.PostProcess(
      `${this.name}_${name}`,
      '3dshaders', // dummy name, we supply shader store
      uniformNames,
      ['textureSampler'],
      1.0,
      this.camera,
      BABYLON.Texture.BILINEAR_SAMPLINGMODE,
      this._engine,
      false,
      fragment
    );

    // Set initial values
    pass.onApply = (effect) => {
      for (const key of uniformNames) {
        const val = settings[key];
        if (val === undefined) continue;
        if (Array.isArray(val)) {
          if (val.length === 2) effect.setFloat2(key, val[0], val[1]);
          else if (val.length === 3) effect.setFloat3(key, val[0], val[1], val[2]);
          else if (val.length === 4) effect.setFloat4(key, val[0], val[1], val[2], val[3]);
        } else {
          effect.setFloat(key, val);
        }
      }
    };

    this._passes.set(name, pass);
  }

  /**
   * Dispose all created post-processes.
   */
  dispose() {
    for (const pass of this._passes.values()) {
      pass.dispose();
    }
    this._passes.clear();
    this.controller.dispose();
  }
}

export default BabylonPostProcess;
