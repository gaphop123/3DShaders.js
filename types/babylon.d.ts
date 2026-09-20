export class BabylonPostProcess {
  constructor(camera: any, options?: { BABYLON?: any; name?: string });
  controller: import('./index').ShaderController;
  set(name: string, value: number | object): this;
  get(name: string): any;
  setMany(map: Record<string, number | object>): this;
  enable(name: string): this;
  disable(name: string): this;
  reset(): this;
  onChange(cb: (settings: any) => void): () => void;
  dispose(): void;
}

export class BabylonShaderEffect {
  constructor(engine: any, name: string, options?: { BABYLON?: any; params?: object });
  effect: any;
  name: string;
  dispose(): void;
}

export function createBabylonEffect(engine: any, name: string, options?: object): any;
