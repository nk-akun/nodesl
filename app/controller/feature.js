"use strict";

const Controller = require("egg").Controller;
const PgClient = require("./config");
const { Date, GetRandomId } = require("./utils");

class FeatureController extends Controller {
  async getFeatureByOrg() {
    let flag = this.ctx.query.flag;
    let organizationid = this.ctx.params.organizationid;
    let ans = await this.getDeviceListByOrg(organizationid, flag);

    this.ctx.body = ans;
    return;
  }

  async getDeviceListByOrg(orgId, flag) {
    let ans = [];

    // true时需要查询子结构的device列表
    if (flag == "true") {
      let orgList = [];
      let orgResult = await PgClient.query(
        "select organizationid from ti_organization where parentid = " +
          "'" +
          orgId +
          "'"
      );
      orgList = orgResult.rows;
      for (var idx in orgList) {
        let childDeviceList = await this.getDeviceListByOrg(
          orgList[idx].organizationid,
          flag
        );
        ans = ans.concat(childDeviceList);
        // console.log(213123123, orgList[idx].organizationid, childDeviceList);
      }
    }

    // 查询父结构的device列表
    let organizationid = orgId;
    let featureResult = await PgClient.query(
      "select * from ti_featurebase where organizationid = " +
        "'" +
        organizationid +
        "'"
    );

    let devices = [];
    let deMap = {};

    for (var idx in featureResult.rows) {
      devices.push("'" + featureResult.rows[idx].deviceid + "'");
      deMap[featureResult.rows[idx].deviceid] =
        featureResult.rows[idx].organizationid;
    }

    if (devices.length == 0) {
      this.ctx.body = [];
      return;
    }

    let devs = devices.join(",");
    let devResult = await PgClient.query(
      "select * from ti_device where deviceid in " + "(" + devs + ")"
    );

    let data = devResult.rows;
    for (var idx in data) {
      data[idx].organizationid = deMap[data[idx].deviceid];
    }

    ans = ans.concat(data);
    for (var idx = 0; idx < ans.length; idx++) {
      if (ans[idx] == null) {
        ans.splice(idx, 1);
        idx--;
      }
    }

    return ans;
  }
}

module.exports = FeatureController;
