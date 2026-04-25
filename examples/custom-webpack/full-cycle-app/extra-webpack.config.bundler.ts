import { Configuration } from 'webpack';
// This subpath export only resolves with moduleResolution:bundler (no physical file at this path).
// If the builder overrides moduleResolution to 'node', this import fails with TS2307.
// Regression test for: https://github.com/just-jeb/angular-builders/issues/2025
// We use an empty type import (`import type {}`) to test pure path resolution without
// depending on any specific exported member name.
import type {} from '@angular/core/primitives/di';

export default {
  plugins: [],
} as Configuration;
