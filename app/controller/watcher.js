const Controller = require("egg").Controller;
const PgClient = require("./config");
const { Pool, Client } = require("pg");

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 20 (also configurable)

class WatcherController extends Controller {
  async index() {
    this.data = "";
    // callback - checkout a client
    let organizationid = this.ctx.params.organizationid;

    console.log(organizationid);

    let _this = this;
    let data = await PgClient.query(
      "SELECT * from ti_organization where organizationid = " +
        "'" +
        organizationid +
        "'"
    );
    //.then((res)=>{
    //  this.data = res.rows
    //})

    console.log(data);

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
  async update_left() {
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
      "update ti_organization set left_watcherid = " +
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
    client.end();
  }
  async update_right() {
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
      "update ti_organization set right_watcherid = " +
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
    client.end();
  }
  async update_out() {
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
      "update ti_organization set out_watcherid = " +
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
    client.end();
  }
}

module.exports = WatcherController;
