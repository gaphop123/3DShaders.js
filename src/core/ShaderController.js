import { ShaderEffect } from './ShaderEffect.js';

/**
 * Central controller for managing shader effect settings.
 * Provides a simple key-value API for enabling, configuring and querying effects.
 *
 * @example
 * const shaders = new ShaderController();
 * shaders.set('brightness', 0.2);
 * shaders.set('contrast', 1.3);
 * shaders.enable('bloom');
 * shaders.onChange((settings) => console.log(settings));
 */
export class ShaderController {
  /**
   * @param {Object} [options]
   * @param {Object.<string, ShaderEffect>} [options.effects] - Pre-registered effects
   */
  constructor(options = {}) {
    /** @type {Map<string, ShaderEffect>} */
    this._effects = new Map();
    /** @type {Map<string, boolean>} */
    this._enabled = new Map();
    /** @type {Map<string, Object>} */
    this._settings = new Map();
    /** @type {Set<Function>} */
    this._listeners = new Set();
    /** @type {Object} */
    this._defaults = {};

    if (options.effects) {
      for (const [name, effect] of Object.entries(options.effects)) {
        this.register(name, effect);
      }
    }
  }

  /**
   * Register a custom or built-in effect.
   * @param {string} name
   * @param {ShaderEffect|Object} effectOrDefinition
   * @returns {this}
   */
  register(name, effectOrDefinition) {
    if (typeof name !== 'string' || !name) {
      throw new Error('ShaderController.register: name must be a non-empty string');
    }

    let effect;
    if (effectOrDefinition instanceof ShaderEffect) {
      effect = effectOrDefinition;
    } else if (typeof effectOrDefinition === 'object' && effectOrDefinition !== null) {
      effect = new ShaderEffect({
        name,
        ...effectOrDefinition
      });
    } else {
      throw new Error(`ShaderController.register: invalid effect definition for "${name}"`);
    }

    this._effects.set(name, effect);
    this._enabled.set(name, effect.enabled);
    this._settings.set(name, { ...effect.uniforms });
    this._defaults[name] = { ...effect.uniforms };
    return this;
  }

  /**
   * Check if an effect is registered.
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this._effects.has(name);
  }

  /**
   * Get the current value of an effect's primary uniform or full settings object.
   * @param {string} name
   * @returns {*}
   */
  get(name) {
    if (!this._settings.has(name)) {
      throw new Error(`ShaderController.get: unknown effect "${name}"`);
    }
    const settings = this._settings.get(name);
    // Convenience: if only one numeric uniform called "amount" or similar, return the number
    const keys = Object.keys(settings);
    if (keys.length === 1) {
      return settings[keys[0]];
    }
    if (settings.amount !== undefined) return settings.amount;
    if (settings.intensity !== undefined) return settings.intensity;
    return { ...settings };
  }

  /**
   * Set value(s) for an effect.
   * Accepts either a number (maps to amount/intensity) or an options object.
   * @param {string} name
   * @param {number|Object} value
   * @returns {this}
   */
  set(name, value) {
    if (!this._effects.has(name)) {
      throw new Error(`ShaderController.set: unknown effect "${name}". Did you forget to register it?`);
    }

    const effect = this._effects.get(name);
    let newSettings;

    if (typeof value === 'number') {
      // Prefer existing primary keys
      if ('amount' in effect.uniforms) {
        newSettings = { ...this._settings.get(name), amount: value };
      } else if ('intensity' in effect.uniforms) {
        newSettings = { ...this._settings.get(name), intensity: value };
      } else if ('radius' in effect.uniforms) {
        newSettings = { ...this._settings.get(name), radius: value };
      } else {
        // Fallback: set the first numeric uniform
        const firstKey = Object.keys(effect.uniforms)[0] || 'amount';
        newSettings = { ...this._settings.get(name), [firstKey]: value };
      }
    } else if (typeof value === 'object' && value !== null) {
      newSettings = { ...this._settings.get(name), ...value };
    } else {
      throw new Error(`ShaderController.set: value for "${name}" must be a number or object`);
    }

    this._settings.set(name, newSettings);
    effect.setUniform(newSettings);
    this._notify();
    return this;
  }

  /**
   * Set multiple effects at once.
   * @param {Object.<string, number|Object>} map
   * @returns {this}
   */
  setMany(map) {
    if (typeof map !== 'object' || map === null) {
      throw new Error('ShaderController.setMany: expected an object');
    }
    for (const [name, value] of Object.entries(map)) {
      this.set(name, value);
    }
    return this;
  }

  /**
   * Enable an effect.
   * @param {string} name
   * @returns {this}
   */
  enable(name) {
    if (!this._effects.has(name)) {
      throw new Error(`ShaderController.enable: unknown effect "${name}"`);
    }
    this._enabled.set(name, true);
    this._effects.get(name).enabled = true;
    this._notify();
    return this;
  }

  /**
   * Disable an effect.
   * @param {string} name
   * @returns {this}
   */
  disable(name) {
    if (!this._effects.has(name)) {
      throw new Error(`ShaderController.disable: unknown effect "${name}"`);
    }
    this._enabled.set(name, false);
    this._effects.get(name).enabled = false;
    this._notify();
    return this;
  }

  /**
   * Check whether an effect is currently enabled.
   * @param {string} name
   * @returns {boolean}
   */
  isEnabled(name) {
    return this._enabled.get(name) === true;
  }

  /**
   * Reset all effects to their default values and re-enable them.
   * @returns {this}
   */
  reset() {
    for (const [name, defaults] of Object.entries(this._defaults)) {
      this._settings.set(name, { ...defaults });
      this._enabled.set(name, true);
      const effect = this._effects.get(name);
      if (effect) {
        effect.setUniform(defaults);
        effect.enabled = true;
      }
    }
    this._notify();
    return this;
  }

  /**
   * Get a snapshot of all current settings.
   * @returns {Object}
   */
  getSettings() {
    const result = {};
    for (const [name, settings] of this._settings) {
      result[name] = {
        enabled: this._enabled.get(name),
        ...settings
      };
    }
    return result;
  }

  /**
   * Subscribe to changes.
   * @param {Function} callback - receives current settings object
   * @returns {Function} unsubscribe function
   */
  onChange(callback) {
    if (typeof callback !== 'function') {
      throw new Error('ShaderController.onChange: callback must be a function');
    }
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  /**
   * Notify all listeners.
   * @private
   */
  _notify() {
    const settings = this.getSettings();
    for (const cb of this._listeners) {
      try {
        cb(settings);
      } catch (err) {
        console.error('ShaderController.onChange listener error:', err);
      }
    }
  }

  /**
   * Get the underlying ShaderEffect instance.
   * @param {string} name
   * @returns {ShaderEffect|undefined}
   */
  getEffect(name) {
    return this._effects.get(name);
  }

  /**
   * List all registered effect names.
   * @returns {string[]}
   */
  listEffects() {
    return Array.from(this._effects.keys());
  }

  /**
   * Dispose internal resources (listeners).
   */
  dispose() {
    this._listeners.clear();
    this._effects.clear();
    this._enabled.clear();
    this._settings.clear();
  }
}

export default ShaderController;
