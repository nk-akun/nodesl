"use strict";

const Controller = require("egg").Controller;
const PgClient = require("./config");

class OrganizeController extends Controller {
  async query() {
    let organizationid = this.ctx.params.organizationid;

    // 查询子org
    let numResult = await PgClient.query(
      "select count(*) from ti_organization where parentid = " +
        "'" +
        organizationid +
        "'"
    );
    let childNum = numResult.rows[0].count;

    // 查询详细信息
    let dataResult = await PgClient.query(
      "select organizationid,orgname,orgcode from ti_organization where organizationid = " +
        "'" +
        organizationid +
        "'"
    );

    // 信息补充
    let data = dataResult.rows[0];
    data.childnum = childNum;
    this.ctx.body = data;
  }

  async remove() {
    let organizationid = this.ctx.params.organizationid;

    // 查询子org
    let childResult = await PgClient.query(
      "select organizationid from ti_organization where parentid = " +
        "'" +
        organizationid +
        "'"
    );

    // push子org id
    let orgIds = [organizationid];
    for (var idx in childResult.rows) {
      orgIds.push(childResult.rows[idx].organizationid);
    }

    console.log(orgIds);

    for (var orgId in childIds) {
      await PgClient.query(
        "delete from ti_organization where organizationid = " +
          "'" +
          orgId +
          "'"
      );
    }

    data = orgIds.length;
    this.ctx.body = data;
  }
}

module.exports = OrganizeController;
