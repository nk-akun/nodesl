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
}

module.exports = DeviceController;
