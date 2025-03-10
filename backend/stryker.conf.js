/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
  _comment:
    "This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information",
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  coverageAnalysis: 'perTest',
  ignorePatterns: ['main.ts'],
  thresholds: {
    high: 100,
    low: 80,
    break: 0,
  },
  mutator: { plugins: [], excludedMutations: ['StringLiteral'] },
};
