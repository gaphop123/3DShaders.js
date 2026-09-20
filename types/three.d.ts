export class ThreeShaderPass {
  constructor(renderer: any, options?: { THREE?: any });
  controller: import('./index').ShaderController;
  set(name: string, value: number | object): this;
  get(name: string): any;
  setMany(map: Record<string, number | object>): this;
  enable(name: string): this;
  disable(name: string): this;
  reset(): this;
  onChange(cb: (settings: any) => void): () => void;
  setSize(width: number, height: number): void;
  render(inputTexture: any, outputTarget?: any): void;
  dispose(): void;
}

export class ThreeShaderMaterial {
  constructor(options: { THREE: any; effects?: Array<[string, object] | string> });
  material: any;
  addEffect(name: string, params?: object): void;
  setUniform(effectName: string, key: string, value: any): void;
  dispose(): void;
}
