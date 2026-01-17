const base = require('../jest.config.base');

module.exports = {
  ...base,
  setupFilesAfterEnv: ['aws-cdk-lib/testhelpers/jest-autoclean'],
};
