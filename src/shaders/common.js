/**
 * Shared GLSL snippets used by most post-processing effects.
 */

export const DEFAULT_VERTEX = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const FULLSCREEN_VERTEX = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/**
 * Helper to create a standard post-process fragment that samples tDiffuse.
 * The body is inserted after the texture sample.
 */
export function createFragment(body, extraUniforms = '') {
  return /* glsl */ `
uniform sampler2D tDiffuse;
varying vec2 vUv;
${extraUniforms}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  ${body}
  gl_FragColor = color;
}
`;
}
