"use strict";

const Controller = require("egg").Controller;
const PgClient = require("./config");

class RoleController extends Controller {
  async list() {
    console.log("1234");
    let data = await PgClient.query(
      "select roleid,rolename,childdata,sortindex from ti_role"
    );
    console.log("5678");
    console.log(data);
    this.ctx.body = data.rows[0];
  }
}

module.exports = RoleController;
