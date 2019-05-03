/** @format */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.{test,spec}.js'],
  moduleNameMapper: {
    'ts-interface-loader(.*)!./types': '<rootDir>/src/__mocks__/ts-interface-builder/types.ts',
  },
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.ts$': 'babel-jest',
  },
  collectCoverage: true
}
