const mysql = require('mysql');

const pool  = mysql.createPool({
     connectionLimit: 10,
     host: "ohunm00fjsjs1uzy.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
     user: "xoaqqm8vhudnzfhe",
     password: "noo5nfh8fkja5hdo",
     database: "c0oyfnnokfjm0370"
});

module.exports = pool;
