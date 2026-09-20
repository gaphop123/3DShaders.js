import { describe, it, expect, beforeEach } from '@jest/globals';
import { ShaderPipeline } from '../src/core/ShaderPipeline.js';
import { brightness, contrast, blur } from '../src/shaders/index.js';

describe('ShaderPipeline', () => {
  let pipeline;

  beforeEach(() => {
    pipeline = new ShaderPipeline();
    pipeline.register('brightness', brightness);
    pipeline.register('contrast', contrast);
    pipeline.register('blur', blur);
  });

  it('adds effects', () => {
    pipeline.add('brightness', { amount: 0.1 });
    pipeline.add('contrast', { amount: 1.2 });
    const steps = pipeline.getSteps();
    expect(steps.length).toBe(2);
    expect(steps[0].name).toBe('brightness');
  });

  it('removes effects', () => {
    pipeline.add('brightness').add('contrast');
    pipeline.remove('brightness');
    expect(pipeline.getSteps().length).toBe(1);
    expect(pipeline.getSteps()[0].name).toBe('contrast');
  });

  it('enable / disable', () => {
    pipeline.add('blur', { radius: 2 });
    pipeline.disable('blur');
    expect(pipeline.getActiveSteps().length).toBe(0);
    pipeline.enable('blur');
    expect(pipeline.getActiveSteps().length).toBe(1);
  });

  it('clear empties pipeline', () => {
    pipeline.add('brightness').add('contrast');
    pipeline.clear();
    expect(pipeline.getSteps().length).toBe(0);
  });

  it('throws on unregistered effect', () => {
    expect(() => pipeline.add('unknown')).toThrow();
  });
});
