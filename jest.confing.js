// jest.config.js

module.exports = {
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    testEnvironment: 'jsdom',
    moduleNameMapper: {
      '\\.(css|less|scss|sss|styl)$': '<rootDir>/node_modules/jest-css-modules',
    },
  };
  