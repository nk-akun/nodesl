const Controller = require("egg").Controller;
const { Pool, Client } = require("pg");

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 20 (also configurable)

class HomeController extends Controller {
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
    let data = await client.query("SELECT * from ti_organization");
    //.then((res)=>{
    //  this.data = res.rows
    client.end();
    //})
    this.ctx.body = data;
  }
}

module.exports = HomeController;
