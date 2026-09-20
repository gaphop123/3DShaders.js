/**
 * Base class representing a single shader effect.
 * Each effect provides uniforms, vertex and fragment shader snippets.
 * 
 * @typedef {Object} ShaderUniforms
 * @property {number|Object} [key] - Uniform values
 * 
 * @typedef {Object} ShaderEffectOptions
 * @property {string} name - Unique effect name
 * @property {ShaderUniforms} [uniforms] - Default uniforms
 * @property {string} [vertexShader] - Optional vertex shader code
 * @property {string} fragmentShader - Fragment shader code (required)
 * @property {boolean} [enabled=true] - Whether the effect is enabled by default
 * @property {Function} [isActive] - Optional function to check if effect should run
 */

/**
 * Represents a reusable shader effect definition.
 */
export class ShaderEffect {
  /**
   * @param {ShaderEffectOptions} options
   */
  constructor(options = {}) {
    if (!options.name || typeof options.name !== 'string') {
      throw new Error('ShaderEffect: "name" is required and must be a string');
    }
    if (!options.fragmentShader || typeof options.fragmentShader !== 'string') {
      throw new Error(`ShaderEffect "${options.name}": "fragmentShader" is required`);
    }

    this.name = options.name;
    this.uniforms = { ...(options.uniforms || {}) };
    this.vertexShader = options.vertexShader || null;
    this.fragmentShader = options.fragmentShader;
    this.enabled = options.enabled !== false;
    this.isActive = typeof options.isActive === 'function'
      ? options.isActive
      : (uniforms) => this._defaultIsActive(uniforms);
  }

  /**
   * Default activity check: skip if all numeric uniforms that look like "amount/intensity"
   * are zero (or very close to zero).
   * @param {Object} uniforms
   * @returns {boolean}
   * @private
   */
  _defaultIsActive(uniforms) {
    const keys = Object.keys(uniforms);
    if (keys.length === 0) return true;

    const skipKeys = new Set(['tDiffuse', 'resolution', 'time', 'texelSize']);
    let hasMeaningful = false;

    for (const key of keys) {
      if (skipKeys.has(key)) continue;
      const val = uniforms[key];
      if (typeof val === 'number') {
        if (Math.abs(val) > 1e-6) {
          hasMeaningful = true;
          break;
        }
      } else if (val !== null && val !== undefined) {
        hasMeaningful = true;
        break;
      }
    }
    return hasMeaningful;
  }

  /**
   * Create a deep-ish clone of this effect with optional overrides.
   * @param {Partial<ShaderEffectOptions>} [overrides]
   * @returns {ShaderEffect}
   */
  clone(overrides = {}) {
    return new ShaderEffect({
      name: overrides.name || this.name,
      uniforms: { ...this.uniforms, ...(overrides.uniforms || {}) },
      vertexShader: overrides.vertexShader !== undefined ? overrides.vertexShader : this.vertexShader,
      fragmentShader: overrides.fragmentShader || this.fragmentShader,
      enabled: overrides.enabled !== undefined ? overrides.enabled : this.enabled,
      isActive: overrides.isActive || this.isActive
    });
  }

  /**
   * Get current uniform values (copy).
   * @returns {Object}
   */
  getUniforms() {
    return { ...this.uniforms };
  }

  /**
   * Set one or more uniforms.
   * @param {string|Object} keyOrMap
   * @param {*} [value]
   */
  setUniform(keyOrMap, value) {
    if (typeof keyOrMap === 'object' && keyOrMap !== null) {
      Object.assign(this.uniforms, keyOrMap);
    } else if (typeof keyOrMap === 'string') {
      this.uniforms[keyOrMap] = value;
    } else {
      throw new Error('ShaderEffect.setUniform: invalid arguments');
    }
  }
}

export default ShaderEffect;
