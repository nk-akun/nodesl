const Controller = require("egg").Controller;
const { Pool, Client } = require("pg");
const fs = require("fs");

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 20 (also configurable)

class PlanController extends Controller {
  async index() {
    this.data = "";
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });
    // the pool with emit an error on behalf of any idle clients
    // it contains if a backend error or network partition happens
    client.connect();
    // callback - checkout a client
    let _this = this;
    let pageIndex = this.ctx.request.body.pageIndex;
    let pageSize = this.ctx.request.body.pageSize;
    let data = await client.query(
      "SELECT * from tl_plan limit " + pageSize + " offset " + pageIndex
    );
    let result = data.rows;
    this.ctx.body = result;
    client.end();
    //})
  }
}
module.exports = PlanController;
