"use strict";

const Controller = require("egg").Controller;
const PgClient = require("./config");
const { GetRandomId } = require("./utils");

class RoleController extends Controller {
  async create() {
    let rolename = this.ctx.request.body.rolename;
    let childdata = this.ctx.request.body.childdata;
    let roleid = GetRandomId();
    let maxIndex = await PgClient.query(
      "select max(sortindex) as max_index from ti_role"
    );
    let sortIndex = parseInt(maxIndex.rows[0].max_index) + 1;

    let data = await PgClient.query(
      "insert into ti_role (roleid,rolename,childdata,sortindex) values(" +
        "'" +
        roleid +
        "'" +
        "," +
        "'" +
        rolename +
        "'" +
        "," +
        "'" +
        childdata +
        "'" +
        "," +
        "'" +
        sortIndex +
        "'" +
        ")"
    );

    if (data.rowCount > 0) {
      this.ctx.body = data.rowCount;
    } else {
      this.ctx.message = "添加失败";
    }

    return;
  }

  async list() {
    let data = await PgClient.query(
      "select roleid,rolename,childdata,sortindex from ti_role"
    );
    this.ctx.body = data.rows;
  }

  async remove() {
    let roleId = this.ctx.params.roleid;
    let data = await PgClient.query(
      "delete from ti_role where roleid = " + "'" + roleId + "'"
    );
    if (data.rowCount > 0) {
      this.ctx.body = data.rowCount;
    } else {
      this.ctx.body = 0;
      this.ctx.message = "删除失败";
    }
  }
}

module.exports = RoleController;
