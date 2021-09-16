const Controller = require("egg").Controller;
const { Pool, Client } = require("pg");

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 20 (also configurable)

class WatcherController extends Controller {
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
    let organizationid = this.ctx.params.organizationid;
    let _this = this;
    let data = await client.query(
      "SELECT * from ti_organization where organizationid = " +
        "'" +
        organizationid +
        "'"
    );
    //.then((res)=>{
    //  this.data = res.rows
    client.end();
    //})
    let ret = {};
    ret.watcher = data.rows[0].watcherid;
    ret.enable_watcher = data.rows[0].enable_watcher;
    this.ctx.body = ret;
  }
  async update() {
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });
    client.connect();
    let organizationid = this.ctx.params.organizationid;
    let data = await client.query(
      "update ti_organization set watcherid = " +
        "'" +
        this.ctx.request.body.watcher +
        "'" +
        " where organizationid = " +
        "'" +
        organizationid +
        "'"
    );
    this.ctx.body = {
      msg: "更新watcher成功",
      data: this.ctx.request.body.watcher,
    };
    this.ctx.status = 200;
  }
}

module.exports = WatcherController;
