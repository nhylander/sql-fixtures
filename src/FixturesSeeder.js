'use strict';

const sqlString = require('sqlstring');
const Promise = require('bluebird');
const defaults = require('lodash.defaults');

function execQueriesNoForeignKeyConstraints(self, queries) {
    let connection;
    return self.dbEngine.getConnection()
        .then((conn) => {
            connection = conn;
            return connection.query('SET FOREIGN_KEY_CHECKS = 0');
        })
        .then(() => Promise.all(queries.map(sql => connection.query(sql))))
        .then(() => connection.query('SET FOREIGN_KEY_CHECKS = 1'))
        .finally(() => {
            if (connection) connection.release();
        });
}

function isRawSqlString(value) {
    return (typeof value === 'string' || value instanceof String) &&
        value.startsWith('{{') && value.endsWith('}}');
}

function parseValues(values) {
    return values.map((value) => {
        if (isRawSqlString(value)) {
            const rawSqlString = value.slice(2, -2).trim();
            return {
                toSqlString() {
                    return rawSqlString;
                }
            };
        }
        return value;
    });
}

const FixturesSeeder = function (dbEngine) {
    this.fixtures = {};
    this.dbEngine = dbEngine;
};

Object.assign(FixturesSeeder.prototype, {
    addFixture(fixture) {
        this.fixtures[fixture.name] = fixture;
    },

    createRecord(tableName, properties) {
        defaults(properties, this.fixtures[tableName].defaults);
        const columns = Object.keys(properties);
        const values = parseValues(Object.values(properties));
        const insertQuery = sqlString.format('INSERT INTO ?? (??) VALUES (?)', [tableName, columns, values]);
        return execQueriesNoForeignKeyConstraints(this, [insertQuery]);
    },

    seedDbTables(...tables) {
        const insertQueries = tables.map((table) => {
            const seedJson = this.fixtures[table];
            const parsedValues = seedJson.values.map(valueArr => parseValues(valueArr))
            return sqlString.format(
                'INSERT INTO ?? (??) VALUES ?',
                [table, seedJson.columns, parsedValues]
            );
        });
        return execQueriesNoForeignKeyConstraints(this, insertQueries);
    },

    truncateDbTables(...tables) {
        return execQueriesNoForeignKeyConstraints(this, tables.map(table => `TRUNCATE TABLE ${table}`));
    },

    seed() {
        return Promise.all(
            Object.keys(this.fixtures).map(tableNames => this.seedDbTables(tableNames))
        );
    },

    truncate() {
        return Promise.all(
            Object.keys(this.fixtures).map(tableNames => this.truncateDbTables(tableNames))
        );
    }
});

module.exports = FixturesSeeder;
