const { MongoMemoryServer } = require("mongodb-memory-server");

/**
 * Stops the MongoMemoryServer.
 * 
 * This file is configured in jest.config.js and automatically called after all tests.
 * 
 * It uses a global variable previously set in globalSetup.js.
 * 
 * Please do not change this file.
 */
module.exports = async function globalTeardown() {
    const instance = global.__MONGOINSTANCE;
    if (!instance) {
        throw new Error("MongoMemoryServer not found, please fix globalSetup.");
    }
    await instance.stop();
}