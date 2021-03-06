const Controller = require("egg").Controller;
const PgClient = require("./config");
const { Date, GetRandomId, GetMaxSortIndex } = require("./utils");

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
      "insert into ti_device (deviceid,devicecode,devicename,type,state,status,sortindex) values(" +
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

    let context = "default";
    let domain = "scc.ieyeplus.com";
    let auto_record = 0;
    let disabled = 0;
    let weblogin_disabled = 0;
    let created_at = new Date().Format("yyyy-MM-dd HH:mm:ss");
    let updated_at = new Date().Format("yyyy-MM-dd HH:mm:ss");

    let userData = await PgClient.query(
      "insert into users (extn,name,context,domain,password,auto_record,disabled,weblogin_disabled,created_at,updated_at) values(" +
        "'" +
        devicecode +
        "'" +
        "," +
        "'" +
        devicename +
        "'" +
        "," +
        "'" +
        context +
        "'" +
        "," +
        "'" +
        domain +
        "'" +
        "," +
        "'" +
        password +
        "'" +
        "," +
        "'" +
        auto_record +
        "'" +
        "," +
        "'" +
        disabled +
        "'" +
        "," +
        "'" +
        weblogin_disabled +
        "'" +
        "," +
        "'" +
        created_at +
        "'" +
        "," +
        "'" +
        updated_at +
        "'" +
        ")"
    );

    let organizationid = this.ctx.request.body.feature.organizationid;
    let aliasname = this.ctx.request.body.feature.aliasname;
    let featureData = await PgClient.query(
      "insert into ti_featurebase (deviceid,aliasname,organizationid) values(" +
        "'" +
        deviceid +
        "'" +
        "," +
        "'" +
        aliasname +
        "'" +
        "," +
        "'" +
        organizationid +
        "'" +
        ")"
    );

    // console.log(deviceData.rowCount, userData.rowCount, featureData.rowCount);

    // ??????????????????
    if (
      deviceData.rowCount > 0 &&
      userData.rowCount > 0 &&
      featureData.rowCount > 0
    ) {
      this.ctx.body = deviceData.rowCount;
    } else {
      this.ctx.message = "????????????!";
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
            ? "????????????????????????????????????????????????????????????"
            : "?????????freeswitch?????????????????????????????????????????????";
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
      data.result = "?????????????????????????????????????????????";
      this.ctx.body = data;
    }
    client.end();
  }
  async deletes() {
    let requests = this.ctx.request.body;
    let data = [];
    for (let element of requests) {
      await PgClient.query(
        "delete from ti_device where deviceid = " + "'" + element.deviceId + "'"
      );
      await PgClient.query(
        "delete from users where extn = " + "'" + element.deviceCode + "'"
      );
      await PgClient.query(
        "delete from ti_featurebase where deviceid = " +
          "'" +
          element.deviceId +
          "'"
      );
      data.push(element.deviceCode);
    }
    this.ctx.body = data;
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
      data.result = "?????????????????????????????????????????????";
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
