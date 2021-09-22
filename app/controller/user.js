"use strict";

const Controller = require("egg").Controller;
const PgClient = require("./config");

class UserController extends Controller {
  async login() {
    let account = this.ctx.query.account;
    // let password = this.ctx.query.password;
    let data = await PgClient.query(
      "select userid,username,password,idnumber,userphone,userphoto,organizationid,departmentid from ti_user where username=" +
        "'" +
        account +
        "'"
    );
    // console.log(typeof data);
    this.ctx.body = data.rows[0];
  }

  async list() {
    let orgId = this.ctx.request.body.organizationid;

    let data = await PgClient.query(
      "select userid,username,userphoto,organizationid,departmentid from ti_user where organizationid = " +
        "'" +
        orgId +
        "'"
    );

    // 查找所有user
    let users = [];
    for (var idx in data.rows) {
      if (data.rows[idx].username == "超级管理员") {
        continue;
      }
      users.push(data.rows[idx]);
    }

    // 查询相关数据
    for (var i in users) {
      if (users[i].organizationid != null) {
        let orgData = await PgClient.query(
          "select orgname from ti_organization where organizationid = " +
            "'" +
            users[i].organizationid +
            "'"
        );
        users[i].orgname = orgData.rows[0].orgname;
      }
      if (users[i].departmentid != null) {
        let departData = await PgClient.query(
          "select departname from ti_department where departmentid = " +
            "'" +
            users[i].departmentid +
            "'"
        );
        users[i].departname = departData.rows[0].departname;
      }
    }
    this.ctx.body = users;
  }
}

module.exports = UserController;
