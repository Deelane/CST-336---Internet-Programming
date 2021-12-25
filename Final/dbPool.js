const mysql = require('mysql');

/**RETRIEVE Database Credentials**/
//set environment to development
var dbEnv = process.env.NODE_ENV || "production";

//pass environment to creds file and retrieve requested creds
const dbCreds = require("./config/dbCreds.js")[dbEnv];


/**CREATE POOL**/
const pool  = mysql.createPool({
    connectionLimit: 10,
    host: dbCreds.host,
    user: dbCreds.user,
    password: dbCreds.password,
    database: dbCreds.database
});

module.exports = pool;
