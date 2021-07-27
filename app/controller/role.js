"use strict";

const Controller = require("egg").Controller;
const PgClient = require("./config");

class RoleController extends Controller {
  async list() {
    let data = await PgClient.query(
      "select roleid,rolename,childdata,sortindex from ti_role"
    );
    // console.log(data);
    this.ctx.body = data.rows[0];
  }
}

module.exports = RoleController;
