const Controller = require("egg").Controller;
const { Pool, Client } = require("pg");
const PgClient = require("./config");
const fs = require("fs");
const { Date, GetRandomId } = require("./utils");

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 20 (also configurable)

class PlanController extends Controller {
  async list() {
    this.data = "";
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });
    // the pool with emit an error on behalf of any idle clients
    // it contains if a backend error or network partition happens
    client.connect();
    // callback - checkout a client
    let _this = this;
    let pageIndex = this.ctx.request.body.pageIndex;
    let pageSize = this.ctx.request.body.pageSize;
    let data = await client.query(
      "SELECT * from tl_plan limit " + pageSize + " offset " + pageIndex
    );
    let result = data.rows;
    this.ctx.body = result;
    client.end();
    //})
  }

  async create() {
    let planid = GetRandomId();
    let planname = this.ctx.request.body.PlanName;
    let planPreTime = this.ctx.request.body.PlanPreTime;
    let planPreModel = this.ctx.request.body.PlanPreModel;
    let planTime = 1;
    let planmodel = this.ctx.request.body.planmodel;
    let createTime = new Date().Format("yyyy-MM-dd HH:mm:ss");
    let createUserId = this.ctx.request.body.CreateUserID;
    let path = this.ctx.request.body.path;
    let time = this.ctx.request.body.time;
    let meeting = this.ctx.request.body.meeting;
    let cmdtype = this.ctx.request.body.cmdtype;
    let period = this.ctx.request.body.period;

    let data = await PgClient.query(
      "insert into tl_plan (planid,planname,planpretime,planpremodel,plantime,planmodel,createtime,createuserid,path,time,meeting,cmdtype,period) values(" +
        "'" +
        planid +
        "'" +
        "," +
        "'" +
        planname +
        "'" +
        "," +
        "'" +
        planPreTime +
        "'" +
        "," +
        "'" +
        planPreModel +
        "'" +
        "," +
        "'" +
        planTime +
        "'" +
        "," +
        "'" +
        planmodel +
        "'" +
        "," +
        "'" +
        createTime +
        "'" +
        "," +
        "'" +
        createUserId +
        "'" +
        "," +
        "'" +
        path +
        "'" +
        "," +
        "'" +
        time +
        "'" +
        "," +
        "'" +
        meeting +
        "'" +
        "," +
        "'" +
        cmdtype +
        "'" +
        "," +
        "'" +
        period +
        "'" +
        ")"
    );

    if (data.rowCount > 0) {
      this.ctx.body = data.rowCount;
    } else {
      this.ctx.message = "添加失败";
    }
  }

  async removeList() {
    let planIds = [];
    for (var idx in this.ctx.request.body) {
      planIds.push(this.ctx.request.body[idx]);
    }

    let succNum = 0;
    for (var idx in planIds) {
      await PgClient.query(
        "delete from tl_plan where planid = " + "'" + planIds[idx] + "'"
      );
      succNum++;
    }

    this.ctx.body = succNum;
  }
}
module.exports = PlanController;
