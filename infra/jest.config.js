const base = require('../jest.config.base');

module.exports = {
  ...base,
  roots: ['<rootDir>/src/test'],
  setupFilesAfterEnv: ['aws-cdk-lib/testhelpers/jest-autoclean'],
};
