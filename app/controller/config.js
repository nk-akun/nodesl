"use strict";

const { Client } = require("pg");

const PgClient = new Client({
  user: "freeswitch",
  //   host: "10.248.146.65",
  host: "10.3.200.33",
  port: 5432,
  database: "ipbc",
  password: "y2u4evam",
});

PgClient.connect();
module.exports = PgClient;
