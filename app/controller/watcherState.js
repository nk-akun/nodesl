const Controller = require("egg").Controller;
const { Pool, Client } = require("pg");

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 20 (also configurable)

class ActivateWatcherController extends Controller {
  async activate() {
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });
    client.connect();
    let organizationid = this.ctx.params.organizationid;
    let state = this.ctx.request.body.enable_watcher;
    let data = await client.query(
      "update ti_organization set enable_watcher = " +
        state +
        "  where organizationid = " +
        "'" +
        organizationid +
        "'"
    );
    this.ctx.body = data;
    this.ctx.status = 200;
  }
  async activate_left() {
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });
    client.connect();
    let organizationid = this.ctx.params.organizationid;
    let state = this.ctx.request.body.enable_left_watcher;
    let data = await client.query(
      "update ti_organization set enable_left_watcher = " +
        state +
        "  where organizationid = " +
        "'" +
        organizationid +
        "'"
    );
    this.ctx.body = data;
    this.ctx.status = 200;
    client.end();
  }
  async activate_right() {
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });
    client.connect();
    let organizationid = this.ctx.params.organizationid;
    let state = this.ctx.request.body.enable_right_watcher;
    let data = await client.query(
      "update ti_organization set enable_right_watcher = " +
        state +
        "  where organizationid = " +
        "'" +
        organizationid +
        "'"
    );
    this.ctx.body = data;
    this.ctx.status = 200;
    client.end();
  }
  async activate_out() {
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });
    client.connect();
    let organizationid = this.ctx.params.organizationid;
    let state = this.ctx.request.body.enable_out_watcher;
    let data = await client.query(
      "update ti_organization set enable_out_watcher = " +
        state +
        "  where organizationid = " +
        "'" +
        organizationid +
        "'"
    );
    this.ctx.body = data;
    this.ctx.status = 200;
    client.end();
  }
}
module.exports = ActivateWatcherController;
