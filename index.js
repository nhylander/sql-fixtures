'use strict';

const Path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const FixturesSeeder = require('./src/FixturesSeeder');
const Fixture = require('./src/Fixture');

function suppportedFileType(file) {
    const fileExt = file.slice(file.lastIndexOf('.') + 1);
    return fileExt === 'json' || fileExt === 'csv';
}

function createFixture(file, fixturesFolderPath) {
    const filePath = Path.join(process.cwd(), fixturesFolderPath, file);
    return fs.readFileAsync(filePath, 'utf8')
        .then(fileContents => new Fixture(file, fileContents));
}

const Fixtures = function (dbEngine, fixturesFolderPath) {
    const fixturesSeeder = new FixturesSeeder(dbEngine);
    this.seederPromise = fs.readdirAsync(fixturesFolderPath)
        .then((files) => {
            return Promise.all(files.reduce((fixtures, file) => {
                if (suppportedFileType(file)) {
                    fixtures.push(createFixture(file, fixturesFolderPath));
                }
                return fixtures;
            }, []));
        })
        .then((fixtures) => {
            fixtures.forEach(fixture => fixturesSeeder.addFixture(fixture));
            return fixturesSeeder;
        });
};

Object.assign(Fixtures.prototype, {
    createRecord(...args) {
        return this.seederPromise.then(fixturesSeeder => fixturesSeeder.createRecord(...args));
    },

    seedDbTables(...args) {
        return this.seederPromise.then(fixturesSeeder => fixturesSeeder.seedDbTables(...args));
    },

    truncateDbTables(...args) {
        return this.seederPromise.then(fixturesSeeder => fixturesSeeder.truncateDbTables(...args));
    },

    seed() {
        return this.seederPromise.then(fixturesSeeder => fixturesSeeder.seed());
    },

    truncate() {
        return this.seederPromise.then(fixturesSeeder => fixturesSeeder.truncate());
    }
});

module.exports = Fixtures;
