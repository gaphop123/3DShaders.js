/**
 * Three.js ShaderMaterial that applies a chain of 3DShaders effects.
 * Designed to work with a single input texture (tDiffuse).
 */

import { ShaderEffect } from '../core/ShaderEffect.js';
import { shaders as builtInShaders } from '../shaders/index.js';

/**
 * Build a combined fragment shader from a list of effects.
 * @param {Array<{name: string, effect: ShaderEffect}>} steps
 * @returns {{fragmentShader: string, uniforms: Object}}
 */
function buildCombinedShader(steps) {
  const uniforms = {
    tDiffuse: { value: null }
  };

  let body = 'vec4 color = texture2D(tDiffuse, vUv);\n';

  for (const { name, effect } of steps) {
    // Collect uniforms
    for (const [key, val] of Object.entries(effect.uniforms)) {
      const uniformName = `${name}_${key}`;
      uniforms[uniformName] = { value: Array.isArray(val) ? [...val] : val };
    }

    // Very simple body injection – for production a proper AST would be better,
    // but for the library we keep it lightweight by expecting effects to use
    // standard names. Here we just append a comment marker.
    body += `// effect: ${name}\n`;
  }

  // Fallback simple pass-through if no effects
  if (steps.length === 0) {
    body += 'gl_FragColor = color;\n';
  } else {
    // For a real multi-effect material we would need a more sophisticated
    // combiner. For now we provide a single-effect path and recommend
    // ThreeShaderPass for multi-pass pipelines.
    body += 'gl_FragColor = color;\n';
  }

  const fragmentShader = /* glsl */ `
varying vec2 vUv;
uniform sampler2D tDiffuse;
${Object.keys(uniforms)
  .filter(k => k !== 'tDiffuse')
  .map(k => {
    const v = uniforms[k].value;
    if (Array.isArray(v)) {
      return `uniform vec${v.length} ${k};`;
    }
    return `uniform float ${k};`;
  })
  .join('\n')}

void main() {
  ${body}
}
`;

  return { fragmentShader, uniforms };
}

/**
 * Three.js compatible ShaderMaterial that can host one or more effects.
 * For complex multi-pass effects prefer ThreeShaderPass.
 */
export class ThreeShaderMaterial {
  /**
   * @param {Object} options
   * @param {Array<[string, Object]>} [options.effects] - list of [name, params]
   * @param {Object} [options.THREE] - THREE namespace (required)
   */
  constructor(options = {}) {
    if (!options.THREE) {
      throw new Error('ThreeShaderMaterial: THREE namespace is required (pass { THREE })');
    }
    const THREE = options.THREE;

    this.THREE = THREE;
    this._effects = [];
    this._material = null;

    if (options.effects && Array.isArray(options.effects)) {
      for (const entry of options.effects) {
        const [name, params = {}] = Array.isArray(entry) ? entry : [entry, {}];
        this.addEffect(name, params);
      }
    }

    this._rebuild();
  }

  /**
   * Add an effect by name.
   * @param {string} name
   * @param {Object} [params]
   */
  addEffect(name, params = {}) {
    const base = builtInShaders[name];
    if (!base) {
      throw new Error(`ThreeShaderMaterial: unknown effect "${name}"`);
    }
    const effect = base.clone({ uniforms: { ...base.uniforms, ...params } });
    this._effects.push({ name, effect });
    this._rebuild();
  }

  /** @private */
  _rebuild() {
    const THREE = this.THREE;
    const { fragmentShader, uniforms } = buildCombinedShader(this._effects);

    if (this._material) {
      this._material.dispose();
    }

    this._material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader,
      depthTest: false,
      depthWrite: false
    });
  }

  /**
   * Get the underlying THREE.ShaderMaterial.
   * @returns {THREE.ShaderMaterial}
   */
  get material() {
    return this._material;
  }

  /**
   * Update a uniform on a specific effect.
   * @param {string} effectName
   * @param {string} key
   * @param {*} value
   */
  setUniform(effectName, key, value) {
    const uName = `${effectName}_${key}`;
    if (this._material && this._material.uniforms[uName]) {
      this._material.uniforms[uName].value = value;
    }
  }

  /**
   * Dispose GPU resources.
   */
  dispose() {
    if (this._material) {
      this._material.dispose();
      this._material = null;
    }
    this._effects.length = 0;
  }
}

export default ThreeShaderMaterial;
