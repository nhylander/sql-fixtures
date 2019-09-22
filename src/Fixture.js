'use strict';

function parseCell(cell) {
    const value = cell.trim();
    if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).trim();
    if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1).trim();
    if (value === 'null') return null;
    if (!isNaN(value)) return Number(value);
    if (value.startsWith('{{') && value.endsWith('}}')) {
        return {
            toSqlString() {
                return value.slice(2, -2).trim();
            }
        }
    }
    return value;
}

function getFixtureInfo(fileContents, fileExt) {
    if (fileExt === 'json') {
        return JSON.parse(fileContents);
    }
    const fileLines = fileContents.split(/\r?\n/);
    return {
        columns: fileLines.shift().split(',').map(col => col.trim()),
        values: fileLines.map(line => line.split(',').map(cell => parseCell(cell)))
    }
}

const Fixture = function(fileName, fileContents) {
    this.name = fileName.slice(0, fileName.lastIndexOf('.'));
    const fileExt = fileName.slice(fileName.lastIndexOf('.') + 1);
    Object.assign(this, getFixtureInfo(fileContents, fileExt));
}

module.exports = Fixture;
