"use strict";

const Controller = require("egg").Controller;
const PgClient = require("./config");

class RoleController extends Controller {
  async list() {
    let data = await PgClient.query(
      "select roleid,rolename,childdata,sortindex from ti_role"
    );
    // console.log(data);
    this.ctx.body = data.rows;
  }

  async remove() {
    let roleId = this.ctx.params.roleid;
    let data = await PgClient.query(
      "delete from ti_role where roleid = " + "'" + roleId + "'"
    );
    // console.log(data);
    if (data.rowCount > 0) {
      this.ctx.body = data.rowCount;
      this.ctx.message = "操作成功";
    } else {
      this.ctx.body = 0;
      this.ctx.message = "删除失败";
    }
  }
}

module.exports = RoleController;
