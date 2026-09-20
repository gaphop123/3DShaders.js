export interface ShaderUniforms {
  [key: string]: number | number[] | boolean | null;
}

export interface ShaderEffectOptions {
  name: string;
  uniforms?: ShaderUniforms;
  vertexShader?: string | null;
  fragmentShader: string;
  enabled?: boolean;
  isActive?: (uniforms: ShaderUniforms) => boolean;
}

export class ShaderEffect {
  name: string;
  uniforms: ShaderUniforms;
  vertexShader: string | null;
  fragmentShader: string;
  enabled: boolean;
  isActive: (uniforms: ShaderUniforms) => boolean;

  constructor(options: ShaderEffectOptions);
  clone(overrides?: Partial<ShaderEffectOptions>): ShaderEffect;
  getUniforms(): ShaderUniforms;
  setUniform(keyOrMap: string | ShaderUniforms, value?: any): void;
}

export class ShaderController {
  constructor(options?: { effects?: Record<string, ShaderEffect> });
  register(name: string, effectOrDefinition: ShaderEffect | ShaderEffectOptions): this;
  has(name: string): boolean;
  get(name: string): any;
  set(name: string, value: number | object): this;
  setMany(map: Record<string, number | object>): this;
  enable(name: string): this;
  disable(name: string): this;
  isEnabled(name: string): boolean;
  reset(): this;
  getSettings(): Record<string, any>;
  onChange(callback: (settings: Record<string, any>) => void): () => void;
  getEffect(name: string): ShaderEffect | undefined;
  listEffects(): string[];
  dispose(): void;
}

export class ShaderPipeline {
  constructor(options?: { registry?: Record<string, ShaderEffect> });
  register(name: string, definition: ShaderEffect | ShaderEffectOptions): this;
  add(name: string, params?: object): this;
  insert(index: number, name: string, params?: object): this;
  remove(name: string): this;
  enable(name: string): this;
  disable(name: string): this;
  clear(): this;
  set(name: string, params: object): this;
  getActiveSteps(): Array<{ name: string; effect: ShaderEffect }>;
  getSteps(): Array<{ name: string; enabled: boolean; uniforms: ShaderUniforms }>;
  onChange(callback: (steps: any[]) => void): () => void;
  dispose(): void;
}

export const shaders: Record<string, ShaderEffect>;
export const presets: {
  cinematic(): object;
  vintage(): object;
  noir(): object;
  cold(): object;
  warm(): object;
  retro(): object;
  dream(): object;
};

export function createController(): ShaderController;
export default ShaderController;
