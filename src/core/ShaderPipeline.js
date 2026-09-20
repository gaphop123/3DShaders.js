import { ShaderEffect } from './ShaderEffect.js';

/**
 * Ordered pipeline of shader effects that can be applied sequentially.
 * Supports enable/disable, reordering and custom effects.
 *
 * @example
 * const pipeline = new ShaderPipeline();
 * pipeline
 *   .add('brightness', { amount: 0.1 })
 *   .add('contrast', { amount: 1.3 })
 *   .add('blur', { radius: 2 });
 */
export class ShaderPipeline {
  /**
   * @param {Object} [options]
   * @param {Object.<string, ShaderEffect>} [options.registry] - Effect registry
   */
  constructor(options = {}) {
    /** @type {Array<{name: string, effect: ShaderEffect, enabled: boolean}>} */
    this._steps = [];
    /** @type {Map<string, ShaderEffect>} */
    this._registry = new Map();
    /** @type {Set<Function>} */
    this._listeners = new Set();

    if (options.registry) {
      for (const [name, effect] of Object.entries(options.registry)) {
        this._registry.set(name, effect);
      }
    }
  }

  /**
   * Register an effect definition so it can be added later.
   * @param {string} name
   * @param {ShaderEffect|Object} definition
   * @returns {this}
   */
  register(name, definition) {
    const effect = definition instanceof ShaderEffect
      ? definition
      : new ShaderEffect({ name, ...definition });
    this._registry.set(name, effect);
    return this;
  }

  /**
   * Add an effect to the end of the pipeline.
   * @param {string} name
   * @param {Object} [params] - Initial uniform values
   * @returns {this}
   */
  add(name, params = {}) {
    if (!this._registry.has(name)) {
      throw new Error(`ShaderPipeline.add: effect "${name}" is not registered`);
    }
    const base = this._registry.get(name);
    const effect = base.clone({ uniforms: { ...base.uniforms, ...params } });
    this._steps.push({
      name,
      effect,
      enabled: true
    });
    this._notify();
    return this;
  }

  /**
   * Insert an effect at a specific index.
   * @param {number} index
   * @param {string} name
   * @param {Object} [params]
   * @returns {this}
   */
  insert(index, name, params = {}) {
    if (!this._registry.has(name)) {
      throw new Error(`ShaderPipeline.insert: effect "${name}" is not registered`);
    }
    const base = this._registry.get(name);
    const effect = base.clone({ uniforms: { ...base.uniforms, ...params } });
    this._steps.splice(index, 0, {
      name,
      effect,
      enabled: true
    });
    this._notify();
    return this;
  }

  /**
   * Remove the first occurrence of an effect by name.
   * @param {string} name
   * @returns {this}
   */
  remove(name) {
    const idx = this._steps.findIndex(s => s.name === name);
    if (idx !== -1) {
      this._steps.splice(idx, 1);
      this._notify();
    }
    return this;
  }

  /**
   * Enable an effect by name.
   * @param {string} name
   * @returns {this}
   */
  enable(name) {
    for (const step of this._steps) {
      if (step.name === name) {
        step.enabled = true;
        step.effect.enabled = true;
      }
    }
    this._notify();
    return this;
  }

  /**
   * Disable an effect by name.
   * @param {string} name
   * @returns {this}
   */
  disable(name) {
    for (const step of this._steps) {
      if (step.name === name) {
        step.enabled = false;
        step.effect.enabled = false;
      }
    }
    this._notify();
    return this;
  }

  /**
   * Clear all steps.
   * @returns {this}
   */
  clear() {
    this._steps.length = 0;
    this._notify();
    return this;
  }

  /**
   * Update parameters of an existing step.
   * @param {string} name
   * @param {Object} params
   * @returns {this}
   */
  set(name, params) {
    for (const step of this._steps) {
      if (step.name === name) {
        step.effect.setUniform(params);
      }
    }
    this._notify();
    return this;
  }

  /**
   * Get ordered list of active steps (enabled only).
   * @returns {Array<{name: string, effect: ShaderEffect}>}
   */
  getActiveSteps() {
    return this._steps
      .filter(s => s.enabled && s.effect.isActive(s.effect.uniforms))
      .map(s => ({ name: s.name, effect: s.effect }));
  }

  /**
   * Get all steps (including disabled).
   * @returns {Array}
   */
  getSteps() {
    return this._steps.map(s => ({
      name: s.name,
      enabled: s.enabled,
      uniforms: s.effect.getUniforms()
    }));
  }

  /**
   * Subscribe to pipeline changes.
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  onChange(callback) {
    if (typeof callback !== 'function') {
      throw new Error('ShaderPipeline.onChange: callback must be a function');
    }
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  /** @private */
  _notify() {
    const snapshot = this.getSteps();
    for (const cb of this._listeners) {
      try {
        cb(snapshot);
      } catch (err) {
        console.error('ShaderPipeline.onChange listener error:', err);
      }
    }
  }

  /**
   * Dispose.
   */
  dispose() {
    this._steps.length = 0;
    this._registry.clear();
    this._listeners.clear();
  }
}

export default ShaderPipeline;
