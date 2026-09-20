import { describe, it, expect, beforeEach } from '@jest/globals';
import { ShaderController } from '../src/core/ShaderController.js';
import { ShaderEffect } from '../src/core/ShaderEffect.js';
import { brightness, contrast } from '../src/shaders/index.js';

describe('ShaderController', () => {
  let controller;

  beforeEach(() => {
    controller = new ShaderController();
    controller.register('brightness', brightness);
    controller.register('contrast', contrast);
  });

  it('registers effects', () => {
    expect(controller.has('brightness')).toBe(true);
    expect(controller.has('unknown')).toBe(false);
  });

  it('sets and gets numeric values', () => {
    controller.set('brightness', 0.25);
    expect(controller.get('brightness')).toBe(0.25);
  });

  it('sets object values', () => {
    controller.set('contrast', { amount: 1.5 });
    expect(controller.get('contrast')).toBe(1.5);
  });

  it('setMany works', () => {
    controller.setMany({ brightness: 0.1, contrast: 1.2 });
    expect(controller.get('brightness')).toBe(0.1);
    expect(controller.get('contrast')).toBe(1.2);
  });

  it('enable / disable', () => {
    controller.disable('brightness');
    expect(controller.isEnabled('brightness')).toBe(false);
    controller.enable('brightness');
    expect(controller.isEnabled('brightness')).toBe(true);
  });

  it('reset restores defaults', () => {
    controller.set('brightness', 0.9);
    controller.reset();
    expect(controller.get('brightness')).toBe(0);
  });

  it('onChange is called', () => {
    let called = false;
    controller.onChange(() => { called = true; });
    controller.set('brightness', 0.1);
    expect(called).toBe(true);
  });

  it('throws on unknown effect', () => {
    expect(() => controller.set('nope', 1)).toThrow();
  });

  it('custom registration', () => {
    controller.register('custom', {
      uniforms: { intensity: 1 },
      fragmentShader: 'void main(){ gl_FragColor = vec4(1.0); }'
    });
    expect(controller.has('custom')).toBe(true);
    controller.set('custom', 0.5);
    expect(controller.get('custom')).toBe(0.5);
  });

  it('dispose clears state', () => {
    controller.dispose();
    expect(controller.listEffects().length).toBe(0);
  });
});
