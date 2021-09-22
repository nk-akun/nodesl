const Controller = require("egg").Controller;
const PgClient = require("./config");
const { GetRandomId, GetMaxSortIndex } = require("./utils");

class DeviceController extends Controller {
  async create() {
    let devicecode = this.ctx.request.body.devicecode;
    let devicename = this.ctx.request.body.devicename;
    let password = this.ctx.request.body.password;
    let type = this.ctx.request.body.type;
    let deviceid = GetRandomId();
    let state = "unregistered";
    let status = 1;

    let maxIndex = await PgClient.query(
      "select max(sortindex) as max_index from ti_device"
    );

    let sortIndex = parseInt(maxIndex.rows[0].max_index) + 1;

    let deviceData = await PgClient.query(
      "insert into ti_device (deviceid,devicecode,devicename,password,type,state,status,sortindex) values(" +
        "'" +
        deviceid +
        "'" +
        "," +
        "'" +
        devicecode +
        "'" +
        "," +
        "'" +
        devicename +
        "'" +
        "," +
        "'" +
        password +
        "'" +
        "," +
        "'" +
        type +
        "'" +
        "," +
        "'" +
        state +
        "'" +
        "," +
        "'" +
        status +
        "'" +
        "," +
        "'" +
        sortIndex +
        "'" +
        ")"
    );

    // 返回值已简化
    if (deviceData.rowCount > 0) {
      this.ctx.body = deviceData.rowCount;
    } else {
      this.ctx.message = "修改失败!";
    }
  }
  async create_multicast() {
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
    let devicecode;
    let devicename = this.ctx.request.body.devicename;
    let type = this.ctx.request.body.type;
    let ipaddress = this.ctx.request.body.ipaddress;
    let port = this.ctx.request.body.port;
    let organizationid = this.ctx.request.body.organizationid;
    let deviceid = uuid.v1().replace(/-/g, "");
    let data = {};
    data.result = {};
    if (
      typeof ipaddress == "string" &&
      ipaddress != "" &&
      typeof port == "string" &&
      port != ""
    ) {
      let query1 = await client.query(
        "select max(to_number(devicecode,'9999')) from ti_device where type = 2"
      );
      if (query1.rows[0].max == null) devicecode = "9600";
      else devicecode = String(parseInt(query1.rows[0].max) + 1);
      let already_exist_1 = await client.query(
        "select * from users where extn = " + "'" + devicecode + "'"
      );
      let already_exist_2 = await client.query(
        "select * from ti_device where devicecode =" + "'" + devicecode + "'"
      );

      if (already_exist_1.rows.length > 0 || already_exist_2.rows.length > 0) {
        data.code = 2;
        data.result =
          already_exist_2.rows.length > 0
            ? "设备在后台数据库中已经存在，请勿重复添加"
            : "设备在freeswitch数据库中已经存在，请勿重复添加";
        this.ctx.body = data;
      } else {
        await client.query(
          "INSERT INTO ti_device (deviceid,devicecode,devicename,ipaddress,port,type,status) VALUES (" +
            "'" +
            deviceid +
            "'" +
            "," +
            "'" +
            devicecode +
            "'" +
            "," +
            "'" +
            devicename +
            "'" +
            "," +
            "'" +
            ipaddress +
            "'" +
            "," +
            "'" +
            port +
            "'" +
            "," +
            "'" +
            type +
            "'" +
            "," +
            "'" +
            "1" +
            "')"
        );
        await client.query(
          "INSERT INTO ti_featurebase (deviceid,aliasname,organizationid) VALUES (" +
            "'" +
            deviceid +
            "'," +
            "''," +
            "'" +
            organizationid +
            "'" +
            ")"
        );
        await client.query(
          "INSERT INTO users (extn,name,password,context) VALUES (" +
            "'" +
            devicecode +
            "'," +
            "'" +
            devicecode +
            "'," +
            "'1234'," +
            "'default')"
        );
        data.code = 1;
        data.result = {
          deviceid: deviceid,
          devicename: devicename,
          devicecode: devicecode,
          ipaddress: ipaddress,
          port: port,
          type: type,
        };
        this.ctx.body = data;
      }
    } else {
      data.code = 0;
      data.result = "参数格式错误，请核对后重新测试";
      this.ctx.body = data;
    }
    client.end();
  }
  async deletes() {
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });
    client.connect();
    let requests = this.ctx.request.body;
    let data = {};
    data.code = 1;
    data.result = [];
    for (let element of requests) {
      await client.query(
        "delete from ti_device where deviceid = " + "'" + element.deviceid + "'"
      );
      await client.query(
        "delete from users where extn = " + "'" + element.devicecode + "'"
      );
      await client.query(
        "delete from ti_featurebase where deviceid = " +
          "'" +
          element.deviceid +
          "'"
      );
      data.result.push(element.devicecode);
    }
    this.ctx.body = data;
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
    let data = {};
    data.result = {};
    let deviceid = this.ctx.params.deviceid;
    if (typeof deviceid == "string" && deviceid != undefined) {
      let detail = await client.query(
        "select * from ti_device where deviceid =" + "'" + deviceid + "'"
      );
      let feature = await client.query(
        "select * from ti_featurebase where deviceid =" + "'" + deviceid + "'"
      );
      data.result = detail.rows[0];
      data.result.deature = feature.rows[0];
      data.result.password = "";
      data.code = 1;
      this.ctx.body = data;
    } else {
      data.code = 0;
      data.result = "参数格式错误，请核对后重新测试";
      this.ctx.body = data;
    }
    client.end();
  }

  async all() {
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });
    client.connect();
    let data = {};
    let tmp = await client.query("select * from ti_device");
    data.result = tmp.rows;
    this.ctx.body = data;
    client.end();
  }
  async vertos() {
    const client = new Client({
      user: "freeswitch",
      host: "127.0.0.1",
      database: "ipbc",
      password: "y2u4evam",
      port: 5432,
    });
    client.connect();
    let data = {};
    let tmp = await client.query(
      "select array(select vertoid from ti_organization)"
    );
    data.result = tmp.rows[0].array;
    this.ctx.body = data;
    client.end();
  }
}

module.exports = DeviceController;
