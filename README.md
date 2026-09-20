# 3DShaders.js

**Modern shader & post-processing library for Web 3D.**

Easily add brightness, contrast, saturation, blur, bloom, vignette, sharpen, grayscale, chromatic aberration and custom GLSL effects to your Three.js or Babylon.js scenes — without writing full shader pipelines yourself.

[![npm version](https://img.shields.io/npm/v/3dshaders.js.svg)](https://www.npmjs.com/package/3dshaders.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/gaphop123/3DShaders.js/actions/workflows/ci.yml/badge.svg)](https://github.com/gaphop123/3DShaders.js/actions)

---

## What is 3DShaders.js?

3DShaders.js is a lightweight, modular post-processing / shader effect layer designed to sit on top of **Three.js** and **Babylon.js**.

- Pure ES Modules
- No UI framework dependency
- Three.js & Babylon.js are **peer dependencies** (not bundled)
- Clear, consistent API
- Built-in effects + custom GLSL support
- Presets for common looks (cinematic, vintage, noir…)
- Performance-conscious (reuse materials, skip zero-intensity effects, separable blur)

---

## Installation

```bash
npm install 3dshaders.js
```

Peer dependencies (install the ones you use):

```bash
npm install three          # for Three.js
npm install @babylonjs/core # for Babylon.js
```

### CDN (ESM)

```html
<script type="module">
  import { ShaderController, presets } from 'https://cdn.jsdelivr.net/npm/3dshaders.js/+esm';
</script>
```

---

## Quick Start

```js
import { createController, presets } from '3dshaders.js';

const shaders = createController();

shaders.set('brightness', 0.2);
shaders.set('contrast', 1.3);
shaders.set('saturation', 1.2);
shaders.set('blur', { radius: 4 });

shaders.enable('bloom');
shaders.disable('noise');

shaders.onChange((settings) => {
  console.log(settings);
});

// Apply a preset
shaders.setMany(presets.cinematic());
```

---

## Core API

### ShaderController

```js
import { ShaderController, createController } from '3dshaders.js';

const shaders = createController(); // pre-loaded with all built-in effects

shaders.set('brightness', 0.25);
shaders.get('brightness');          // → 0.25

shaders.setMany({
  brightness: 0.1,
  contrast: 1.2,
  saturation: 1.1
});

shaders.enable('bloom');
shaders.disable('bloom');
shaders.isEnabled('bloom');

shaders.reset();                    // back to defaults
shaders.getSettings();              // full snapshot
```

### ShaderPipeline

```js
import { ShaderPipeline } from '3dshaders.js';
import { shaders } from '3dshaders.js/shaders';

const pipeline = new ShaderPipeline({ registry: shaders });

pipeline
  .add('brightness', { amount: 0.1 })
  .add('contrast', { amount: 1.3 })
  .add('saturation', { amount: 1.2 })
  .add('blur', { radius: 2 });

pipeline.remove('blur');
pipeline.enable('bloom');
pipeline.disable('noise');
pipeline.clear();
```

### Custom Shader

```js
shaders.register('myEffect', {
  uniforms: { intensity: 1 },
  vertexShader: `...`,          // optional
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    varying vec2 vUv;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      // your code
      gl_FragColor = color * intensity;
    }
  `
});

pipeline.add('myEffect', { intensity: 0.8 });
```

---

## Built-in Effects

| Effect | API example | Notes |
|--------|-------------|-------|
| **Brightness** | `set('brightness', 0.25)` | -1 … 1 |
| **Contrast** | `set('contrast', 1.5)` | 0 = gray, 1 = original |
| **Saturation** | `set('saturation', 0.5)` | 0 = grayscale |
| **Grayscale** | `set('grayscale', 1)` | 0–1 mix |
| **Invert** | `set('invert', 1)` | 0–1 mix |
| **Blur** | `set('blur', { radius: 5 })` | Separable Gaussian |
| **Sharpen** | `set('sharpen', { amount: 1.2 })` | Unsharp mask |
| **Vignette** | `set('vignette', { intensity: 0.8, softness: 0.5 })` | |
| **Bloom** | `set('bloom', { intensity: 1.5, threshold: 0.8, radius: 0.2 })` | Soft threshold |
| **Chromatic Aberration** | `set('chromaticAberration', { amount: 0.003 })` | |
| **Color Temperature** | `set('colorTemperature', { temperature: 6500 })` | Kelvin |
| **Exposure** | `set('exposure', 1.2)` | Multiplicative |
| **Gamma** | `set('gamma', 2.2)` | |
| **Noise** | `set('noise', { amount: 0.1 })` | |
| **Film Grain** | `set('filmGrain', { amount: 0.15 })` | Animated |
| **Pixelate** | `set('pixelate', { size: 8 })` | |
| **Fog** | `set('fog', { density: 0.02 })` | Simple haze |

---

## Three.js Integration

```js
import * as THREE from 'three';
import { ThreeShaderPass } from '3dshaders.js/three';

const renderer = new THREE.WebGLRenderer();
const pass = new ThreeShaderPass(renderer, { THREE });

pass.set('brightness', 0.2);
pass.set('contrast', 1.4);
pass.set('bloom', { intensity: 0.8 });

// In your render loop:
renderer.setRenderTarget(myRenderTarget);
renderer.render(scene, camera);
renderer.setRenderTarget(null);

pass.render(myRenderTarget.texture); // draws to screen
// or pass.render(myRenderTarget.texture, anotherTarget);
```

### ThreeShaderMaterial

```js
import { ThreeShaderMaterial } from '3dshaders.js/three';

const material = new ThreeShaderMaterial({
  THREE,
  effects: [
    ['brightness', { amount: 0.1 }],
    ['contrast', { amount: 1.3 }],
    ['saturation', { amount: 1.2 }]
  ]
});

// Use material.material with a mesh / fullscreen quad
```

Compatible with `WebGLRenderer`, `WebGLRenderTarget`, `Texture`, `ShaderMaterial` and works alongside `EffectComposer`.

---

## Babylon.js Integration

```js
import { BabylonPostProcess } from '3dshaders.js/babylon';

const post = new BabylonPostProcess(camera, { BABYLON });

post.set('brightness', 0.2);
post.set('contrast', 1.3);
post.set('saturation', 1.1);

// Effects are attached as Babylon PostProcesses on the camera
```

---

## Presets

```js
import { presets } from '3dshaders.js';

shaders.setMany(presets.cinematic());
shaders.setMany(presets.vintage());
shaders.setMany(presets.noir());
shaders.setMany(presets.cold());
shaders.setMany(presets.warm());
shaders.setMany(presets.retro());
shaders.setMany(presets.dream());
```

Presets are pure data — they only combine existing effects.

---

## Performance Notes

- Materials and shader programs are **cached** and reused.
- Effects with near-zero intensity are skipped when possible (`isActive`).
- Blur uses a **separable** 9-tap Gaussian approximation.
- Call `dispose()` when you no longer need a pass/controller.
- Prefer `setSize()` when the viewport changes instead of recreating everything.
- No allocations inside the hot render path.

---

## Package Exports

```js
import { ShaderController, createController, presets } from '3dshaders.js';
import { ThreeShaderPass, ThreeShaderMaterial } from '3dshaders.js/three';
import { BabylonPostProcess } from '3dshaders.js/babylon';
import { shaders, brightness, bloom } from '3dshaders.js/shaders';
```

---

## Browser Compatibility

- Modern browsers with WebGL or WebGL2
- ES Module support required
- Tested conceptually with Chrome, Firefox, Safari, Edge (recent versions)

---

## Examples

- `examples/three-basic` – rotating cube + sphere, full GUI (brightness, contrast, saturation, blur, bloom, vignette, grayscale, chromatic aberration)
- `examples/babylon-basic` – similar demo for Babylon.js
- `examples/three-effects` / `examples/three-bloom` – stubs for further demos

Open the HTML files with a local static server (or use the import map).

---

## Testing

```bash
npm test
```

Covers ShaderController, ShaderPipeline, enable/disable, reset, custom registration and disposal.

---

## License

MIT © gaphop123

---

## Contributing

Issues and PRs welcome at [github.com/gaphop123/3DShaders.js](https://github.com/gaphop123/3DShaders.js).
