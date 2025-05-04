import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1", // Changed from src/$1 to match tsconfig
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
    "^.+\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  modulePaths: ['<rootDir>'],
  roots: ['<rootDir>'],
  reporters: [
    'default',
    [ 'jest-junit', {
      outputDirectory: './reports',
      outputName: 'junit.xml'
    }],
    ['jest-html-reporter', {
      pageTitle: 'Test Report',
      outputPath: 'reports/test-report.html',
      includeFailureMsg: true,
      includeConsoleLog: true
    }]
  ],
};

export default config;
