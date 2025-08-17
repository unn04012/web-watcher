// apps/crawler/jest.config.js
module.exports = {
  displayName: 'crawler',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['src/**/*.ts', 'functions/**/*.ts', '!**/*.d.ts'],
  //   moduleNameMapping: {
  //     '@web-watcher/shared': '<rootDir>/../../packages/shared/src',
  //     '@web-watcher/database': '<rootDir>/../../packages/database/src',
  //   },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 30000,
};
