/**
 * Three.js post-process pass that applies a chain of 3DShaders effects.
 * Compatible with EffectComposer or can be used standalone with a renderer.
 */

import { ShaderController } from '../core/ShaderController.js';
import { shaders as builtInShaders } from '../shaders/index.js';
import { DEFAULT_VERTEX } from '../shaders/common.js';

/**
 * A single full-screen pass for one effect.
 * Internally creates a ShaderMaterial and manages a RenderTarget when needed.
 */
export class ThreeShaderPass {
  /**
   * @param {Object} renderer - THREE.WebGLRenderer
   * @param {Object} [options]
   * @param {Object} [options.THREE] - THREE namespace (if not global)
   */
  constructor(renderer, options = {}) {
    if (!renderer) {
      throw new Error('ThreeShaderPass: renderer is required');
    }

    this.renderer = renderer;
    this.THREE = options.THREE || (typeof window !== 'undefined' ? window.THREE : null);
    if (!this.THREE) {
      throw new Error('ThreeShaderPass: THREE namespace must be provided via options.THREE');
    }

    const THREE = this.THREE;

    /** @type {ShaderController} */
    this.controller = new ShaderController();
    for (const [name, effect] of Object.entries(builtInShaders)) {
      this.controller.register(name, effect);
    }

    // Full-screen quad
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._geometry = new THREE.PlaneGeometry(2, 2);

    /** @type {Map<string, THREE.ShaderMaterial>} */
    this._materials = new Map();
    /** @type {THREE.WebGLRenderTarget|null} */
    this._rtA = null;
    /** @type {THREE.WebGLRenderTarget|null} */
    this._rtB = null;

    this._scene = new THREE.Scene();
    this._mesh = new THREE.Mesh(this._geometry);
    this._scene.add(this._mesh);

    this._needsResize = true;
    this._width = 1;
    this._height = 1;
  }

  /**
   * Set an effect parameter (delegates to controller).
   * @param {string} name
   * @param {number|Object} value
   * @returns {this}
   */
  set(name, value) {
    this.controller.set(name, value);
    this._invalidateMaterial(name);
    return this;
  }

  /**
   * Get current value.
   * @param {string} name
   */
  get(name) {
    return this.controller.get(name);
  }

  setMany(map) {
    this.controller.setMany(map);
    for (const name of Object.keys(map)) {
      this._invalidateMaterial(name);
    }
    return this;
  }

  enable(name) {
    this.controller.enable(name);
    return this;
  }

  disable(name) {
    this.controller.disable(name);
    return this;
  }

  reset() {
    this.controller.reset();
    this._materials.clear();
    return this;
  }

  onChange(cb) {
    return this.controller.onChange(cb);
  }

  /**
   * Ensure render targets match current size.
   * @param {number} width
   * @param {number} height
   */
  setSize(width, height) {
    if (width === this._width && height === this._height) return;
    this._width = width;
    this._height = height;
    this._needsResize = true;

    const THREE = this.THREE;
    if (this._rtA) this._rtA.setSize(width, height);
    if (this._rtB) this._rtB.setSize(width, height);
  }

  /** @private */
  _ensureTargets() {
    const THREE = this.THREE;
    if (!this._rtA) {
      this._rtA = new THREE.WebGLRenderTarget(this._width, this._height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      });
    }
    if (!this._rtB) {
      this._rtB = new THREE.WebGLRenderTarget(this._width, this._height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      });
    }
  }

  /** @private */
  _getMaterial(name) {
    if (this._materials.has(name)) {
      return this._materials.get(name);
    }

    const effect = this.controller.getEffect(name);
    if (!effect) {
      throw new Error(`ThreeShaderPass: unknown effect "${name}"`);
    }

    const THREE = this.THREE;
    const uniforms = {
      tDiffuse: { value: null }
    };

    for (const [key, val] of Object.entries(effect.uniforms)) {
      uniforms[key] = { value: Array.isArray(val) ? val.slice() : val };
    }

    // Always supply resolution if the shader may need it
    if (!uniforms.resolution) {
      uniforms.resolution = { value: [this._width, this._height] };
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: effect.vertexShader || DEFAULT_VERTEX,
      fragmentShader: effect.fragmentShader,
      depthTest: false,
      depthWrite: false
    });

    this._materials.set(name, material);
    return material;
  }

  /** @private */
  _invalidateMaterial(name) {
    if (this._materials.has(name)) {
      this._materials.get(name).dispose();
      this._materials.delete(name);
    }
  }

  /**
   * Apply the currently enabled effects to an input texture and render
   * the result either to a target or to the screen.
   *
   * @param {THREE.Texture} inputTexture
   * @param {THREE.WebGLRenderTarget|null} [outputTarget=null] - null = screen
   */
  render(inputTexture, outputTarget = null) {
    if (!inputTexture) {
      throw new Error('ThreeShaderPass.render: inputTexture is required');
    }

    this._ensureTargets();

    const size = this.renderer.getSize(new this.THREE.Vector2());
    this.setSize(size.x, size.y);

    const active = this.controller.listEffects().filter(n => this.controller.isEnabled(n));
    if (active.length === 0) {
      // Just blit
      this._blit(inputTexture, outputTarget);
      return;
    }

    let read = inputTexture;
    let write = this._rtA;
    let useA = true;

    for (let i = 0; i < active.length; i++) {
      const name = active[i];
      const mat = this._getMaterial(name);
      const effect = this.controller.getEffect(name);
      const settings = this.controller.getSettings()[name];

      // Update uniforms from controller
      for (const [key, val] of Object.entries(settings)) {
        if (key === 'enabled') continue;
        if (mat.uniforms[key]) {
          mat.uniforms[key].value = Array.isArray(val) ? val.slice() : val;
        }
      }
      if (mat.uniforms.resolution) {
        mat.uniforms.resolution.value = [this._width, this._height];
      }
      mat.uniforms.tDiffuse.value = read;

      this._mesh.material = mat;

      const isLast = i === active.length - 1;
      const target = isLast ? outputTarget : write;

      this.renderer.setRenderTarget(target);
      this.renderer.render(this._scene, this._camera);

      if (!isLast) {
        read = write.texture;
        write = useA ? this._rtB : this._rtA;
        useA = !useA;
      }
    }

    this.renderer.setRenderTarget(null);
  }

  /** @private */
  _blit(texture, target) {
    const THREE = this.THREE;
    // Simple copy material
    if (!this._copyMat) {
      this._copyMat = new THREE.ShaderMaterial({
        uniforms: { tDiffuse: { value: null } },
        vertexShader: DEFAULT_VERTEX,
        fragmentShader: /* glsl */ `
          uniform sampler2D tDiffuse;
          varying vec2 vUv;
          void main() {
            gl_FragColor = texture2D(tDiffuse, vUv);
          }
        `,
        depthTest: false,
        depthWrite: false
      });
    }
    this._copyMat.uniforms.tDiffuse.value = texture;
    this._mesh.material = this._copyMat;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this._scene, this._camera);
    this.renderer.setRenderTarget(null);
  }

  /**
   * Dispose all GPU resources.
   */
  dispose() {
    if (this._rtA) this._rtA.dispose();
    if (this._rtB) this._rtB.dispose();
    for (const mat of this._materials.values()) {
      mat.dispose();
    }
    this._materials.clear();
    if (this._copyMat) this._copyMat.dispose();
    this._geometry.dispose();
    this.controller.dispose();
  }
}

export default ThreeShaderPass;
