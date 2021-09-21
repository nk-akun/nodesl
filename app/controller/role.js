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

  async remove() {
    let roleId = this.ctx.params.roleid;
    let data = await PgClient.query(
      "delete from ti_role where roleid = " + "'" + roleId + "'"
    );
    // console.log(data);
    if (data.rowCount > 0) {
      this.ctx.body = data.rowCount;
      this.ctx.set("code", 1);
    } else {
      this.ctx.message = "删除失败";
      this.ctx.set("code", 0);
    }
  }
}

module.exports = RoleController;
