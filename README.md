# Fixtures

This is a simple tool used to populate a DB with seed data. Used for testing and development purposes only.

## Usage

To get started you will need install the repo as a dependency in your repo

```
npm install -D sql-fixtures
```

Once installed create a directory to hold fixtures data. By default this repo is expected to be `./fixtures/` of root directory but it can be configured when instantiating fixtures. You then add json/csv files to fixtures folder to represent table data. Each fixtures file must be named as follows `<TABLE_NAME>.json` where `<TABLE_NAME>` is the db table you wish to seed with data. If working with tables in multiple databases use teh full schema table name of `<SCHEMA_NAME>.<TABLE_NAME>` e.g. `test_database.users.json`

The fixture file must take the following format (using example clients table)
```json
// users.json
{
    "columns": ["id", "name", "username", "password"],
    "values": [
        [1, "one", "oneusername", "onehashedpassword"],
        [2, "two", "twousername", "twohashedpassword"],
        [3, "three", "threeusername", "threehashedpassword"],
        [4, "four", "fourusername", "fourhashedpassword"],
        [5, "five", "fiveusername", "fivehashedpassword"]
    ],
    "defaults": {
        "password": "somesecret"
    }
}
```
CSV files are also supported to hold fixture data, but currently it does not support default values
```csv
id,name,username,password
1,one,oneusername,onehashedpassword
2,two,twousername,twohashedpassword
3,three,threeusername,threehashedpassword
4,four,fourusername,fourhashedpassword
5,five,fiveusername,fivehashedpassword
```
Note Numeric values will be parsed into js Number values. If you want to use a numeric string in a csv file, wrap the value in quotes like `'1'` or `"1"`

In the json file columns represents the DB table columns and each entry in values array represents the values to be populated in the table. Note the order of the values must match the order of the columns, so in the above example `values[0][2]` has value `"oneusername"` and it matches to column `columns[2]` `username`. 

To populate your DB then you must first create a Fixtures instance like so:

```javascript
const Fixtures = require('fixtures');
const dbpool = createDbPool(); // creates some db pool for DB access.

const fixtures = new Fixtures(dbPool); // expects fixtures folder to be ./fixtures
// or
const fixtures = new Fixtures(dbPool, 'test/fixtures'); // will look for seed data in test/fixtures/ folder
```

Then you can call to fixtures functions as follows:
```javascript
fixtures.seedDbTables('users'); // looks for users.json in fixtures folder and will populate users table with all values

fixtures.truncateDbTables('users'); // truncates entire users table

fixtures.createRecord('users', { id: 99, name: 'John', username: 'jman' }); // creates user record in users table with valus given, takes default value for password as defined in users.json example above

// seed/truncate multiple tables at once as follows
fixtures.seedDbTables('users', 'comments');
fixtures.truncateDbTables('users', 'comments');

// seed the database with everything in your fixtures folder
fixtures.seed();

// truncate all tables in your database that are represented in your fixtures folder
fixtures.truncate();
```

### Notes

This library was built with a dependency on node module `promise-mysql` and on creation it expects a `promise-mysql` `dbPool` to be passed to it. However technically you could instead pass any object provided it has functions `getConnection()` which returns a bluebird promise that returns a `connection` object with the functions `query(sqlString)`, and `release()`, which both return bluebird promises on completion.