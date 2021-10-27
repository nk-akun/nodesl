"use strict";

const Controller = require("egg").Controller;
const PgClient = require("./config");
const { Date, GetRandomId } = require("./utils");

class FeatureController extends Controller {
  async getFeatureByOrg() {
    let flag = this.ctx.query.flag;
    if (flag) {
      this.ctx.body = {};
      return;
    }

    let organizationid = this.ctx.params.organizationid;
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

    let devs = devices.join(",");
    let devResult = await PgClient.query(
      "select * from ti_device where deviceid in " + "(" + devs + ")"
    );

    let data = devResult.rows;
    for (var idx in data) {
      data[idx].organizationid = deMap[data[idx].deviceid];
    }

    this.ctx.body = data;
  }
}

module.exports = FeatureController;
