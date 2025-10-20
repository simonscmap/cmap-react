module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '<rootDir>/**/tests/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@adobe/css-tools$': '<rootDir>/src/__mocks__/@adobe/css-tools.js',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(@adobe|@testing-library))'],
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/**/*.d.ts'],
};
