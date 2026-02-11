export default {
    testEnvironment: 'node',
    transform: {},
    testMatch: ['**/tests/**/*.test.js'],
    moduleFileExtensions: ['js', 'json'],
    collectCoverageFrom: ['src/**/*.js', 'index.js'],
    coverageDirectory: 'coverage',
    verbose: true,
};
