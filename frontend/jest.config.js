const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts)'],
  setupFilesAfterEnv: ['<rootDir>/src/test.ts'],
  reporters: [
    "default",
    ["jest-junit", {outputDirectory: "reports"}]
  ],
  coverageReporters: ['text-summary', 'html', 'lcov', 'cobertura'],
  coverageDirectory: 'coverage',
  "coveragePathIgnorePatterns": ["test/mock"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: '<rootDir>/'
  }),
  transformIgnorePatterns:  [
     "/node_modules/(?!ol).+\.js$, node_modules/(?!(ol|ol\\\\-ext)/)\", \"node_modules/(?!(ol\\\\-ext)/)"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testSequencer: "<rootDir>/src/test/alphabeticTestSequencer.js"
};
