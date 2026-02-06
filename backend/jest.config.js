module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/scripts/**',
    '!src/wiring/**',
    '!src/domain/repositories/**',
    '!src/config/**',
  ],
  setupFiles: ['<rootDir>/tests/jest.setup.js'],
};
