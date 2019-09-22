'use strict';

/* eslint-env mocha */
/* eslint-env chai */
/* eslint-disable prefer-arrow-callback */

const expect = require('chai').expect;
const mysql = require('promise-mysql');
const Promise = require('bluebird');
const moment = require('moment');
const SqlFixtures = require('../');

const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password1',
    database: 'test',
    timezone: 'utc'
};
let dbPool;
let fixtures;

describe('Fixtures test', function () {
    before('setup', async function () {
        dbPool = await mysql.createPool(dbConfig);
        fixtures = new SqlFixtures(dbPool, 'test/fixtures');
    });

    after('teardown', async function () {
        await fixtures.truncate();
        return dbPool.end();
    });

    beforeEach('teardown', function () {
        return fixtures.truncate();
    });

    describe('seed', function () {
        it('populates the db with everything in fixtures folder', function () {
            return Promise.all([
                dbPool.query('SELECT * FROM effective_things'),
                dbPool.query('SELECT * FROM names'),
                dbPool.query('SELECT * FROM items'),
                dbPool.query('SELECT * FROM sub_items')
            ])
                .spread((effectiveThings, names, items, subItems) => {
                    expect(effectiveThings.length).to.equal(0);
                    expect(names.length).to.equal(0);
                    expect(items.length).to.equal(0);
                    expect(subItems.length).to.equal(0);
                })
                .then(() => fixtures.seed())
                .then(() => Promise.all([
                    dbPool.query('SELECT * FROM effective_things'),
                    dbPool.query('SELECT * FROM names'),
                    dbPool.query('SELECT * FROM items'),
                    dbPool.query('SELECT * FROM sub_items')
                ]))
                .spread((effectiveThings, names, items, subItems) => {
                    expect(effectiveThings.length).to.equal(3);
                    expect(names.length).to.equal(9);
                    expect(items.length).to.equal(2);
                    expect(subItems.length).to.equal(3);
                });
        });
    });

    describe('truncate', function () {
        it('truncates the of every table in fixtures folder', function () {
            return Promise.all([
                dbPool.query('SELECT * FROM effective_things'),
                dbPool.query('SELECT * FROM names'),
                dbPool.query('SELECT * FROM items'),
                dbPool.query('SELECT * FROM sub_items')
            ])
                .spread((effectiveThings, names, items, subItems) => {
                    expect(effectiveThings.length).to.equal(0);
                    expect(names.length).to.equal(0);
                    expect(items.length).to.equal(0);
                    expect(subItems.length).to.equal(0);
                })
                .then(() => fixtures.seed())
                .then(() => Promise.all([
                    dbPool.query('SELECT * FROM effective_things'),
                    dbPool.query('SELECT * FROM names'),
                    dbPool.query('SELECT * FROM items'),
                    dbPool.query('SELECT * FROM sub_items')
                ]))
                .spread((effectiveThings, names, items, subItems) => {
                    expect(effectiveThings.length).to.equal(3);
                    expect(names.length).to.equal(9);
                    expect(items.length).to.equal(2);
                    expect(subItems.length).to.equal(3);
                })
                .then(() => fixtures.truncate())
                .then(() => Promise.all([
                    dbPool.query('SELECT * FROM effective_things'),
                    dbPool.query('SELECT * FROM names'),
                    dbPool.query('SELECT * FROM items'),
                    dbPool.query('SELECT * FROM sub_items')
                ]))
                .spread((effectiveThings, names, items, subItems) => {
                    expect(effectiveThings.length).to.equal(0);
                    expect(names.length).to.equal(0);
                    expect(items.length).to.equal(0);
                    expect(subItems.length).to.equal(0);
                });
        });
    });

    describe('Raw sql templating', function () {
        describe('should seed with moustache values', function () {
            it('should write current timestamp with NOW()', function () {
                return fixtures.seed()
                    .then(() => dbPool.query('SELECT * FROM names where id = 9'))
                    .then(([nameRecord]) => {
                        const createdAt = nameRecord.created_at;
                        expect(createdAt).to.not.equal('0000-00-00 00:00:00');
                        const past = moment().subtract(5, 'seconds');
                        const future = moment().add(5, 'seconds');
                        const createdAtMoment = moment(createdAt);
                        expect(createdAtMoment.isBetween(past, future)).to.equal(true);
                    });
            });
        });
    
        describe('should createRecord with moustache values', function () {
            it('should write current timestamp with NOW()', function () {
                const record = {
                    id: 999,
                    name: 'John',
                    name_points: 200,
                    thing_id: 1,
                    created_at: '{{ NOW() }}'
                };
    
                return fixtures.createRecord('test.names', record)
                    .then(() => dbPool.query('SELECT * FROM test.names'))
                    .get(0)
                    .then((nameRecord) => {
                        expect(nameRecord.name).to.equal('John');
                        const createdAt = nameRecord.created_at;
                        expect(createdAt).to.not.equal('0000-00-00 00:00:00');
                        const past = moment().subtract(5, 'seconds');
                        const future = moment().add(5, 'seconds');
                        const createdAtMoment = moment(createdAt);
                        expect(createdAtMoment.isBetween(past, future)).to.equal(true);
                    });
            });
        });
    });
});
