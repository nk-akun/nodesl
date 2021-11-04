"use strict";

const Controller = require("egg").Controller;
const PgClient = require("./config");
const { GetRandomId } = require("./utils");

class OrganizeController extends Controller {
  async create() {
    // {"orgcode":"000003","orgname":" 北邮中心","parentid":"b202669251a046bbbc727ff3fb25f9f4","vertoid":"9903","voicecallid":"9203","meetingid":"9403","broadid":"9303","alarmid":"9103"}
    let organizationid = GetRandomId();
    let orgname = this.ctx.request.body.orgname;
    let orgcode = this.ctx.request.body.orgcode;
    let parentid = this.ctx.request.body.parentid;
    let vertoid = this.ctx.request.body.vertoid;
    let voicecallid = this.ctx.request.body.voicecallid;
    let meetingid = this.ctx.request.body.meetingid;
    let broadid = this.ctx.request.body.broadid;
    let alarmid = this.ctx.request.body.alarmid;
    let fullname = orgname;
    let enable_left_watcher = false;
    let enable_right_watcher = false;
    let enable_out_watcher = false;
    let maxIndex = await PgClient.query(
      "select max(sortindex) as max_index from ti_organization"
    );
    let sortIndex = parseInt(maxIndex.rows[0].max_index) + 1;

    // 校验是否已经存在，替前端填坑
    let existData = await PgClient.query(
      "select count(*) from ti_organization where orgcode = " +
        "'" +
        orgcode +
        "'"
    );

    if (existData.rowCount > 0) {
      this.ctx.body = 0;
      this.ctx.message = "添加失败,已存在";
      return;
    }

    let data = await PgClient.query(
      "insert into ti_organization (organizationid,orgname,orgcode,parentid,vertoid,voicecallid,meetingid,broadid,alarmid,fullname,enable_left_watcher,enable_right_watcher,enable_out_watcher,sortindex) values(" +
        "'" +
        organizationid +
        "'" +
        "," +
        "'" +
        orgname +
        "'" +
        "," +
        "'" +
        orgcode +
        "'" +
        "," +
        "'" +
        parentid +
        "'" +
        "," +
        "'" +
        vertoid +
        "'" +
        "," +
        "'" +
        voicecallid +
        "'" +
        "," +
        "'" +
        meetingid +
        "'" +
        "," +
        "'" +
        broadid +
        "'" +
        "," +
        "'" +
        alarmid +
        "'" +
        "," +
        "'" +
        fullname +
        "'" +
        "," +
        "'" +
        enable_left_watcher +
        "'" +
        "," +
        "'" +
        enable_right_watcher +
        "'" +
        "," +
        "'" +
        enable_out_watcher +
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
  }

  async list() {
    let pageIndex = 1;
    let pageSize = 1000;
    console.log(this.ctx.request.body);
    if (this.ctx.request.body.pageIndex != null) {
      pageIndex = this.ctx.request.body.pageIndex;
    }
    if (this.ctx.request.body.pageSize != null) {
      pageSize = this.ctx.request.body.pageSize;
    }
    let data = await PgClient.query(
      "select organizationid,orgname,orgcode from ti_organization order by sortindex offset " +
        pageIndex +
        " limit " +
        pageSize
    );

    for (var i = 0; i < data.rows.length; i++) {
      let orgId = data.rows[i].organizationid;
      let childdata = await PgClient.query(
        "select count(*) from ti_organization where parentid = " +
          "'" +
          orgId +
          "'"
      );
      data.rows[i].childnum = childdata.rows[0].count;
    }

    this.ctx.body = data.rows;
  }

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

    // console.log(orgIds);

    for (var idx in orgIds) {
      await PgClient.query(
        "delete from ti_organization where organizationid = " +
          "'" +
          orgIds[idx] +
          "'"
      );
    }

    let data = orgIds.length;
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
      childList.push(child[0]);
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
    return result;
  }
}

module.exports = OrganizeController;
