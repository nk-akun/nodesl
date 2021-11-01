"use strict";

const Controller = require("egg").Controller;
const PgClient = require("./config");

class OrganizeController extends Controller {
  async queryData() {
    let organizationid = this.ctx.params.organizationid;

    let result = await this.queryOrgById(organizationid);

    // 信息补充
    this.ctx.body = result;
  }

  async queryDetail() {
    let organizationid = this.ctx.params.organizationid;

    // 查询详细信息
    let dataResult = await PgClient.query(
      "select * from ti_organization where organizationid = " +
        "'" +
        organizationid +
        "'"
    );

    // 信息补充
    let data = {};
    if (dataResult.rows.length > 0) {
      data = dataResult.rows[0];
    } else {
      this.ctx.message = "查询失败，无此记录";
    }
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

  async queryOrgById(organizationid) {
    // 查询子org
    let childResult = await PgClient.query(
      "select organizationid from ti_organization where parentid = " +
        "'" +
        organizationid +
        "'"
    );

    let childNum = childResult.rowCount;
    let childList = [];
    for (var i = 0; i < childResult.rows.length; i++) {
      let child = await this.queryOrgById(childResult.rows[i].organizationid);
      childList.push(child);
    }

    // 查询详细信息
    let orgResult = await PgClient.query(
      "select organizationid,orgname,orgcode from ti_organization where organizationid = " +
        "'" +
        organizationid +
        "'"
    );
    let result = orgResult.rows;
    result[0].childnum = childNum;
    result[0].Children = childList;

    console.log(result);
    return result;
  }
}

module.exports = OrganizeController;
