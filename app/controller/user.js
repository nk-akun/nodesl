"use strict";

const Controller = require("egg").Controller;
const PgClient = require("./config");
const { GetRandomId } = require("./utils");

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
      let roleData = await PgClient.query(
        "select roleid from tr_user_role where userid=" + "'" + userid + "'"
      );
      if (roleData.rowCount > 0) {
        let roleid = roleData.rows[0].roleid;
        let roleInfo = await PgClient.query(
          "select * from ti_role where roleid=" + "'" + roleid + "'"
        );
        if (roleInfo.rowCount > 0) {
          users[i].rolename = roleInfo.rows[0].rolename;
        }
      }
    }
    this.ctx.body = users;
  }

  async detail() {
    let userid = this.ctx.params.userid;
    let userData = await PgClient.query(
      "select * from ti_user where userid = " + "'" + userid + "'"
    );

    if (userData.rowCount == 0) {
      this.ctx.message = "查询失败!";
      return;
    }

    let userInfo = userData.rows[0];
    userInfo.userRoles = [];
    let userRoles = [];

    let roleData = await PgClient.query(
      "select roleid from tr_user_role where userid=" + "'" + userid + "'"
    );
    if (roleData.rowCount > 0) {
      for (var idx in roleData.rows) {
        let tmp = {};
        tmp.roleid = roleData.rows[idx].roleid;
        tmp.userid = userid;
        userRoles.push(tmp);
      }
    }
    userInfo.userRoles = userRoles;

    if (userData.rowCount > 0) {
      this.ctx.body = userInfo;
    } else {
      this.ctx.message = "查询失败!";
    }
  }

  async create() {
    let orgId = this.ctx.request.body.OrganizationID;
    let username = this.ctx.request.body.username;
    // userRoles在数据表中没有体现
    let password = this.ctx.request.body.password;
    let userid = GetRandomId();

    // TODO: 此处有并发风险
    let maxIndex = await PgClient.query(
      "select max(sortindex) as max_index from ti_user"
    );

    let sortIndex = parseInt(maxIndex.rows[0].max_index) + 1;
    let userData = await PgClient.query(
      "insert into ti_user (userid,username,password,organizationid,sortindex) values(" +
        "'" +
        userid +
        "'" +
        "," +
        "'" +
        username +
        "'" +
        "," +
        "'" +
        password +
        "'" +
        "," +
        "'" +
        orgId +
        "'" +
        "," +
        "'" +
        sortIndex +
        "'" +
        ")"
    );

    this.ctx.body = userData.rowCount;
  }

  async edit() {
    let orgId = this.ctx.request.body.OrganizationID;
    let username = this.ctx.request.body.username;
    // userRoles在数据表中没有体现
    let password = this.ctx.request.body.password;
    let userid = this.ctx.request.body.userid;

    let editData = await PgClient.query(
      "update ti_user set organizationid = " +
        "'" +
        orgId +
        "'" +
        "," +
        "username = " +
        "'" +
        username +
        "'" +
        "," +
        "password = " +
        "'" +
        password +
        "'" +
        "where userid = " +
        "'" +
        userid +
        "'"
    );

    if (editData.rowCount > 0) {
      this.ctx.body = editData.rowCount;
    } else {
      this.ctx.message = "修改失败!";
    }
  }

  async remove() {
    let userid = this.ctx.params.userid;
    let remvData = await PgClient.query(
      "delete from ti_user where userid = " + "'" + userid + "'"
    );

    if (remvData.rowCount > 0) {
      this.ctx.body = remvData.rowCount;
    } else {
      this.ctx.message = "删除失败!";
    }
  }
}

module.exports = UserController;
