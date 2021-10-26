const Controller = require("egg").Controller;
const { Pool, Client } = require("pg");
const uuid = require("node-uuid");
const fs = require("fs");

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 20 (also configurable)

class DeviceGroupController extends Controller {
  async create() {
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
    let name = this.ctx.request.body.name;
    let deviceGroups = this.ctx.request.body.deviceGroups;
    let devicegroup_type = this.ctx.request.body.devicegroup_type;
    let devicegroup_uuid = uuid.v1().replace(/-/g, "");
    let data = {};
    let devicegroup_extn;
    if (
      deviceGroups instanceof Array &&
      deviceGroups != [] &&
      name != undefined &&
      devicegroup_type != undefined &&
      name != "" &&
      devicegroup_type != ""
    ) {
      let max_extn = await client.query(
        "select max(to_number(devicegroup_extn,'9999'))  from  tl_devicegroup where devicegroup_type = " +
          "'" +
          devicegroup_type +
          "'"
      );
      if (max_extn.rows[0].max == null) {
        switch (devicegroup_type) {
          case "broad":
            devicegroup_extn = "8500";
            break;
          case "inqueue":
            devicegroup_extn = "8100";
            break;
          case "allqueue":
            devicegroup_extn = "8200";
            break;
          case "radio":
            devicegroup_extn = "8300";
            break;
          case "meeting":
            devicegroup_extn = "8400";
            break;
        }
      } else devicegroup_extn = String(parseInt(max_extn.rows[0].max) + 1);
      await client.query(
        "INSERT INTO tl_devicegroup VALUES (" +
          "'" +
          devicegroup_uuid +
          "'," +
          "'" +
          name +
          "'," +
          "'" +
          devicegroup_extn +
          "'," +
          "'" +
          devicegroup_type +
          "'," +
          "(select max(sortindex) from tl_devicegroup) +1)"
      );
      await client.query(
        "INSERT INTO users (extn,name,password,context) VALUES (" +
          "'" +
          devicegroup_extn +
          "'," +
          "'" +
          devicegroup_extn +
          "'," +
          "'1234'," +
          "'default')"
      );
      data = {
        name: name,
        devicegroupid: devicegroup_uuid,
        devicegroup_extn: devicegroup_extn,
        devicegroup_type: devicegroup_type,
      };
      data.deviceGroups = [];
      for (let i = 0; i < deviceGroups.length; i++) {
        let da = await client.query(
          "INSERT INTO tr_devicegroup_device VALUES (" +
            "'" +
            devicegroup_uuid +
            "'," +
            "'" +
            deviceGroups[i].deviceid +
            "')"
        );
        data.deviceGroups.push(deviceGroups[i].deviceid);
      }
      this.ctx.body = data;
    } else {
      data = "参数格式错误，请核对后重新测试";
      this.ctx.message = "失败";
      this.ctx.body = data;
    }
    client.end();
    //})
  }
  async remove() {
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });
    client.connect();
    let devicegroupid = this.ctx.request.body.deviceGroupId;
    let roleid = this.ctx.request.body.roleid;
    let extn = this.ctx.request.body.extn;
    let data = {};
    if (devicegroupid != undefined && devicegroupid.length == 32) {
      await client.query(
        "delete  from tl_devicegroup where devicegroupid =" +
          "'" +
          devicegroupid +
          "'"
      );
      await client.query(
        "delete  from tr_devicegroup_device where devicegroupid =" +
          "'" +
          devicegroupid +
          "'"
      );
      await client.query(
        "delete from tr_role_device where roleid = " +
          "'" +
          roleid +
          "' and devicegroupid = " +
          "'" +
          devicegroupid +
          "'"
      );
      await client.query("delete from users where extn = " + "'" + extn + "'");
      data = { devicegroupid: devicegroupid };
      this.ctx.body = data;
    } else {
      data = "参数格式错误，请核对后重新测试";
      this.ctx.message = "失败";
      this.ctx.body = data;
    }
    client.end();
  }
  async removeList() {
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });
    client.connect();
    let ids = this.ctx.request.body.ids;
    let roleid = this.ctx.request.body.roleid;
    let extn = this.ctx.request.body.extn;
    let data = [];
    if (ids instanceof Array && ids.length > 0) {
      for (let devicegroupid of ids) {
        await client.query(
          "delete from tl_devicegroup where devicegroupid =" +
            "'" +
            devicegroupid +
            "'"
        );
        await client.query(
          "delete from tr_devicegroup_device where devicegroupid =" +
            "'" +
            devicegroupid +
            "'"
        );
        await client.query(
          "delete from tr_role_device where roleid = " +
            "'" +
            roleid +
            "' and devicegroupid = " +
            "'" +
            devicegroupid +
            "'"
        );
        await client.query(
          "delete from users where extn = " + "'" + extn + "'"
        );
        data.push(devicegroupid);
      }
      this.ctx.body = data;
    } else {
      data = "参数格式错误，请核对后重新测试";
      this.ctx.message = "失败";
      this.ctx.body = data;
    }
    client.end();
  }
  async detail() {
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });
    client.connect();
    let devicegroupid = this.ctx.params.devicegroupid;
    let data = {};
    if (devicegroupid != undefined && devicegroupid.length == 32) {
      let devices = await client.query(
        "select * from tr_devicegroup_device b inner join ti_device c on c.deviceid = b.deviceid where b.devicegroupid = " +
          "'" +
          devicegroupid +
          "'"
      );
      let devicegroup = await client.query(
        "select * from tl_devicegroup where devicegroupid = " +
          "'" +
          devicegroupid +
          "'"
      );
      Object.assign(data.result, devicegroup.rows[0]);
      data.deviceGroups = devices.rows;
      //   data.code = 1;
      this.ctx.body = data;
    } else {
      data = "参数格式错误，请核对后重新测试";
      this.ctx.message = "失败";
      this.ctx.body = data;
    }
    client.end();
  }
  async list() {
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });

    let devicegroupid = this.ctx.request.body.deviceGroupId;
    let pageIndex = this.ctx.request.body.pageIndex;
    let pageSize = this.ctx.request.body.pageSize;
    let name = this.ctx.request.body.name;
    let data = {};
    client.connect();
    let sql_string = "select * from tl_deviceGroup";
    if (devicegroupid != undefined && devicegroupid.length == 32) {
      sql_string += " where devicegroupid = " + "'" + devicegroupid + "'";
    } else if (name != undefined) {
      sql_string += " where name = " + "'" + name + "'";
    }
    if (pageSize != undefined && pageIndex != undefined) {
      sql_string += " limit " + pageSize + " offset " + pageIndex;
    }
    let result = await client.query(sql_string);
    data = result.rows;
    this.ctx.body = data;
    client.end();
  }

  async role() {
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });

    let roleid = this.ctx.params.roleid;
    let data = {};
    client.connect();
    if (roleid != undefined) {
      let sql_string =
        "select * from tl_devicegroup b inner join tr_role_device a on a.devicegroupid = b.devicegroupid where a.roleid = " +
        "'" +
        roleid +
        "'";
      let devicegroups = await client.query(sql_string);
      data = devicegroups.rows;
      this.ctx.body = data;
    } else {
      data = "参数格式错误，请核对后重新测试";
      this.ctx.body = data;
      this.ctx.message = "失败";
    }
    client.end();
  }
  async conf() {
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });
    let confname = this.ctx.request.body.confname;
    let organizationid = this.ctx.request.body.organizationid;
    let roleid = this.ctx.request.body.roleid;
    let data = {};
    data.result = [];
    client.connect();

    let organization_result = await client.query(
      "select * from ti_organization where organizationid = " +
        "'" +
        organizationid +
        "'"
    );
    let group_result = await client.query(
      "select * from  tr_role_device a inner join ti_role b on  a.roleid = b.roleid inner join tl_devicegroup c  on a.devicegroupid = c.devicegroupid   where a.roleid= " +
        "'" +
        roleid +
        "'"
    );
    if (confname != undefined) {
      switch (confname) {
        case "voiceCall":
          data.result.push({
            conf_num: organization_result.rows[0].voicecallid,
            conf_name:
              organization_result.rows[0].voicecallid + "-scc.ieyeplus.com",
            group_name: "语音队列",
          });
          group_result.rows.forEach((row) => {
            if (
              row.devicegroup_extn.slice(0, 2) == "81" ||
              row.devicegroup_extn.slice(0, 2) == "82"
            )
              data.result.push({
                conf_num: row.devicegroup_extn,
                conf_name: row.devicegroup_extn + "-scc.ieyeplus.com",
                group_name: row.name,
              });
          });
          break;
        case "ipBroad":
          data.result.push({
            conf_num: organization_result.rows[0].broadid,
            conf_name:
              organization_result.rows[0].broadid + "-scc.ieyeplus.com",
            group_name: "广播队列",
          });
          group_result.rows.forEach((row) => {
            if (row.devicegroup_extn.slice(0, 2) == "85")
              data.result.push({
                conf_num: row.devicegroup_extn,
                conf_name: row.devicegroup_extn + "-scc.ieyeplus.com",
                group_name: row.name,
              });
          });
          break;
        case "radio":
          data.result.push({
            conf_num: organization_result.rows[0].meetingid,
            conf_name:
              organization_result.rows[0].meetingid + "-scc.ieyeplus.com",
            group_name: "对讲队列",
          });
          group_result.rows.forEach((row) => {
            if (row.devicegroup_extn.slice(0, 2) == "83")
              data.result.push({
                conf_num: row.devicegroup_extn,
                conf_name: row.devicegroup_extn + "-scc.ieyeplus.com",
                group_name: row.name,
              });
          });
          break;
      }
      data.code = 1;
      this.ctx.body = data;
    } else {
      data.code = 0;
      data.result = "参数格式错误，请核对后重新测试";
      this.ctx.body = data;
    }
    client.end();
  }
  async org() {
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });

    let orgid = this.ctx.params.orgid;
    let data = {};
    client.connect();
    if (orgid != undefined) {
      let roleid_object = await client.query(
        "select b.roleid from ti_organization a inner join ti_role b on a.orgname = b.rolename where a.organizationid = " +
          "'" +
          orgid +
          "'"
      );
      let roleid = roleid_object.rows[0].roleid;
      let devicegroups_object = await client.query(
        "select * from  tr_role_device a inner join ti_role b on  a.roleid = b.roleid inner join tl_devicegroup c  on a.devicegroupid = c.devicegroupid   where a.roleid= " +
          "'" +
          roleid +
          "'"
      );
      data.code = 1;
      data.result = [];
      devicegroups_object.rows.forEach((row) => {
        data.result.push({
          conf_num: row.devicegroup_extn,
          conf_name: row.devicegroup_extn + "-scc.ieyeplus.com",
          group_name: row.name,
          id: row.devicegroupid,
        });
      });
      this.ctx.body = data;
    } else {
      data.code = 0;
      data.result = "参数格式错误，请核对后重新测试";
      this.ctx.body = data;
    }
    client.end();
  }
}
module.exports = DeviceGroupController;
