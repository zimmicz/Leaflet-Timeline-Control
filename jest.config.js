module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    ".+\\.(css)$": "jest-transform-stub",
  },
};
