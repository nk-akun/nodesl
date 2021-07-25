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
}

module.exports = UserController;
