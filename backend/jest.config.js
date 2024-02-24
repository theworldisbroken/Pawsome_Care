module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    testMatch: ["**/*.test.js"],

    // start mongo memory server
    globalSetup: "<rootDir>/testConfig/globalSetup.js",
    // stop mongo memory server
    globalTeardown: "<rootDir>/testConfig/globalTeardown.js",
    // connect/disconnect before/after all tests of a suite, clear database before each test
    setupFilesAfterEnv: ["<rootDir>/testConfig/setupFile.js"]
  };