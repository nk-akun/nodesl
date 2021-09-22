const Controller = require('egg').Controller;
const xml2js = require('xml2js');
const parseString = require('xml2js').parseString;
const urlencode = require('urlencode');
const {Pool, Client} = require('pg');
class CallrecordController extends Controller {
   async index() {
    const client = new Client({
      user: 'freeswitch',
      host: '127.0.0.1',
      database: 'ipbc',
      password: 'y2u4evam',
      port: 5432,
    });
    client.connect();
    // 从表单中取xml，再转换成json格式处理 
    let data = this.ctx.request.body.cdr;
    global.result = {};
    var that = this; 
    parseString(data, {explicitArray: false}, (err, json)=>{
      global.result = json
    })
    // 需要数据 
    if (global.result.cdr.variables.last_app == 'bridge' || global.result.cdr.variables.last_app == 'set') {
      let uuid = "a_"+global.result.cdr.variables.uuid;
      let callid = (typeof(global.result.cdr.variables.bridge_uuid)=='undefined'?'':global.result.cdr.variables.bridge_uuid.replace(/-/g, ''));
      let callernumber = (typeof(global.result.cdr.variables.sip_from_user)=='undefined'?global.result.cdr.variables.accountcode:global.result.cdr.variables.sip_from_user)
      let calleenumber = global.result.cdr.variables.dialed_user 
      let context = global.result.cdr.variables.user_context
      let startstamp = urlencode.decode(global.result.cdr.variables.start_stamp, 'gbk');
      let answerstamp = urlencode.decode(global.result.cdr.variables.answer_stamp, 'gbk');
      let endstamp = urlencode.decode(global.result.cdr.variables.end_stamp, 'gbk');
      let duration = global.result.cdr.variables.duration;
      let billsec = global.result.cdr.variables.billsec;
      let hangupcause = global.result.cdr.variables.last_bridge_hangup_cause;
      let accountcode = global.result.cdr.variables.accountcode;
      let sortindex = 0; 
      let sortindexdb = await client.query("SELECT * from tl_callrecord");
      if (sortindexdb.rows.length === 0) {
        sortindex = 1;
      } else {
        sortindex = sortindexdb.rows.length + 1; 
      }
      // 从数据库中获取主叫，被叫名字
      let callernumberdb = await client.query("SELECT * from ti_device where devicecode = " + "'" + callernumber + "'");
      let callername = ''; 
      if (callernumberdb.rows.length === 0) {
        callername = callernumber
      } else {
        callername = callernumberdb.rows[0].devicename
      } 
      let calleenumberdb = await client.query("SELECT * from ti_device where devicecode = " + "'" + calleenumber + "'");
      let calleename = '';
      if (calleenumberdb.rows.length === 0) {
        calleename = calleenumber
      } else {
        calleename = calleenumberdb.rows[0].devicename
      }
      // 从数据库中获取主叫组织号，被叫组织号
      let callerdeviceiddb = await client.query("SELECT * from ti_device where devicecode = " + "'" + callernumber + "'"); 
      let callerdeviceid = '';
      let callerorgid = '';
      if (callerdeviceiddb.rows.length === 0) {
        callerorgid = '00000000000000000000000000000000'
      } else {
        callerdeviceid = callerdeviceiddb.rows[0].deviceid
        let callerorgiddb = await client.query("SELECT * from ti_featurebase where deviceid = " + "'" + callerdeviceid + "'");
        callerorgid = callerorgiddb.rows[0].organizationid
      }
      let calleedeviceiddb = await client.query("SELECT * from ti_device where devicecode = " + "'" + calleenumber + "'");
      let calleedeviceid = '';
      let calleeorgid = '';
      if (calleedeviceiddb.rows.length === 0) {
        calleeorgid = '00000000000000000000000000000000'
      } else {
        calleedeviceid = calleedeviceiddb.rows[0].deviceid
        let calleeorgiddb = await client.query("SELECT * from ti_featurebase where deviceid = " + "'" + calleedeviceid + "'");
        calleeorgid = calleeorgiddb.rows[0].organizationid
      }
      // 插入数据库
      await client.query("INSERT INTO tl_callrecord (callid, uuid, callername, callernumber, calleename, calleenumber, context, startstamp, answerstamp, endstamp, duration, billsec, hangupcause, accountcode, sortindex, callerorgid, calleeorgid, type) VALUES (" + "'" + callid + "'" + "," + "'" + uuid + "'" + "," + "'" + callername + "'" + "," +  "'" + callernumber + "'" + "," + "'" + calleename + "'" + "," + "'" + calleenumber + "'" + "," + "'" + context + "'" + "," + "'" + startstamp + "'" + "," + "'" + answerstamp + "'" + "," + "'" + endstamp + "'" + "," + "'" + duration + "'" + "," + "'" + billsec + "'" + "," + "'" + hangupcause + "'" + "," + "'" + accountcode + "'" + "," + "'" + sortindex + "'" + "," + "'" + callerorgid + "'" + "," + "'" + calleeorgid + "'" + "," + "1" + ")")   
    } 
    this.ctx.body = data
    client.end()
  }
  async list() {
    const client = new Client({
      user: 'freeswitch',
      host: '127.0.0.1',
      database: 'ipbc',
      password: 'y2u4evam',
      port: 5432,
    });
    client.connect();  
    // 需要的数据
    let orgid = this.ctx.params.organizationid;
    let filetype = this.ctx.params.filetype;
    global.orgidarr = []
    global.orgidtmp = []
    global.orgidtmp.push(orgid)
    while (orgidtmp.length != 0) {
      let tmp = global.orgidtmp.length;
      for (var i = 0; i < tmp; i++) {
        let x = global.orgidtmp.shift()
        global.orgidarr.push(x)
        let xdb = await client.query("SELECT * FROM ti_organization WHERE parentid = " + "'" + x +"'")
        if (typeof(xdb.rows[0]) != "undefined") {
          xdb.rows.forEach((orgid) => {
            global.orgidtmp.push(orgid.organizationid)
          }) 
        }
      }
    } 
    // 获取组织以及子组织号 
    let orgiddbstr = '('
    global.orgidarr.forEach((orgid) => {
      orgiddbstr += "'" + orgid + "'" + ",";
    })
    orgiddbstr = orgiddbstr.slice(0, orgiddbstr.length-1)
    orgiddbstr += ")"
    let deviceiddb = await client.query("SELECT * FROM ti_featurebase WHERE organizationid in " + orgiddbstr)
    let deviceid = []
    deviceiddb.rows.forEach((val) => {
      deviceid.push(val.deviceid)
    })
    // 获取组织以及子组织所包含的设备号
    let deviceidstr = '('
    deviceid.forEach((deviceid) => {
      deviceidstr += "'" + deviceid + "'" + ",";
    })
    deviceidstr = deviceidstr.slice(0, deviceidstr.length-1)
    deviceidstr += ")"
    let devicecode = []
    let devicecodedb = await client.query("SELECT * FROM ti_device WHERE deviceid in " + deviceidstr) 
    devicecodedb.rows.forEach((val) => {
      devicecode.push(val.devicecode)
    }) 
    let devicecodestr = '(' 
    devicecode.forEach((devicecode) => {
      devicecodestr += "'" + devicecode + "'" + ",";
    })
    devicecodestr = devicecodestr.slice(0, devicecodestr.length-1)
    devicecodestr += ")"
    let data = this.ctx.request.body;
    let callernumber = data.callernumber;
    let calleenumber = data.calleenumber;
    let startstamp = data.BeginTime;
    let endstamp = data.EndTime;
    let total = data.total;
    let pageindex = data.pageIndex;
    let pagesize = data.pageSize; 
    // 获取总通话记录数
    global.total = 0; 
    // 获取通话记录值
    global.callrecordlist = []
    if (callernumber != '') {
      if (calleenumber != '') {
        if (startstamp != '') {
          if (filetype == 1) {
            let callrecorddbx = await client.query("SELECT * FROM xml_cdr WHERE destination_number = " + "'" + calleenumber + "' and caller_id_number= " + "'" + callernumber + "'" + " and start_stamp >= " + "'" +  startstamp + "'" + " and end_stamp <= " + "'" + endstamp + "'" + " and (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge')");
            global.total = callrecorddbx.rows.length;
            let callrecorddb = await client.query("SELECT * FROM xml_cdr WHERE destination_number = " + "'" + calleenumber + "'" + " and (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge')" + " and caller_id_number = " + "'" + callernumber + "'" + " and start_stamp >= " + "'" +  startstamp + "'" + " and end_stamp <= " + "'" + endstamp + "' order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
          } else {
            let callrecorddbx = await client.query("SELECT * FROM tl_callrecord WHERE calleenumber = " + "'" + calleenumber + "' and callernumber= " + "'" + callernumber + "'" + " and type= " + filetype + " and start_stamp >= " + "'" +  startstamp + "'" + " and end_stamp <= " + "'" + endstamp + "'" + " and (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")");
            global.total = callrecorddbx.rows.length;
            let callrecorddb = await client.query("SELECT * FROM tl_callrecord WHERE calleenumber = " + "'" + calleenumber + "'" + " and (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")" + " and callernumber = " + "'" + callernumber + "'" + " and type= " + filetype + " and start_stamp >= " + "'" +  startstamp + "'" + " and end_stamp <= " + "'" + endstamp + "' order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
            callrecorddb.rows.forEach((val) => {
              global.callrecordlist.push(val)
            }) 
          }
        } else {
          if (filetype == 1) {
            let callrecorddbx = await client.query("SELECT * FROM xml_cdr WHERE destination_number = " + "'" + calleenumber + "' and caller_id_number = '" + callernumber + "'" + " and (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge')");
            global.total = callrecorddbx.rows.length;
            let callrecorddb = await client.query("SELECT * FROM xml_cdr WHERE destination_number = " + "'" + calleenumber + "' and caller_id_number = '" + callernumber + "'" + " and (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge')" + " order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
            callrecorddb.rows.forEach((val) => {
              global.callrecordlist.push(val)
            })
          } else {
          let callrecorddbx = await client.query("SELECT * FROM tl_callrecord WHERE calleenumber = " + "'" + calleenumber + "' and callernumber = '" + callernumber + "'" + " and type= " + filetype + " and (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")");
          global.total = callrecorddbx.rows.length;
          let callrecorddb = await client.query("SELECT * FROM tl_callrecord WHERE calleenumber = " + "'" + calleenumber + "' and callernumber = '" + callernumber + "'" + " and type= " + filetype + " and (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")" + " order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
          callrecorddb.rows.forEach((val) => {
            global.callrecordlist.push(val)
          })
          }
        } 
      } else {
        if (startstamp != '') {
          if (filetype == 1) {
            let callrecorddbx = await client.query("SELECT * FROM xml_cdr WHERE start_stamp >= " + "'" +  startstamp + "'" + " and end_stamp <= " + "'" + endstamp + "'" + " and caller_id_number = '" + callernumber + "'" + " and (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge')");
            global.total = callrecorddbx.rows.length;
            let callrecorddb = await client.query("SELECT * FROM xml_cdr WHERE start_stamp >= " + "'" +  startstamp + "'" + " and end_stamp <= " + "'" + endstamp + "'" + " and (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge')" + " and caller_id_number = " + "'" + callernumber + "' order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
            callrecorddb.rows.forEach((val) => {
              global.callrecordlist.push(val)
            })
          } else {
          let callrecorddbx = await client.query("SELECT * FROM tl_callrecord WHERE start_stamp >= " + "'" +  startstamp + "'" + " and end_stamp <= " + "'" + endstamp + "'" + " and callernumber = '" + callernumber + "'" + " and type= " + filetype + " and (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")");
          global.total = callrecorddbx.rows.length;
          let callrecorddb = await client.query("SELECT * FROM tl_callrecord WHERE start_stamp >= " + "'" +  startstamp + "'" + " and end_stamp <= " + "'" + endstamp + "'" + " and (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")" + " and type= " + filetype + " and callernumber = " + "'" + callernumber + "' order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
          callrecorddb.rows.forEach((val) => {
            global.callrecordlist.push(val)
          }) 
          }
        } else {
          if (filetype == 1) {
            let callrecorddbx = await client.query("SELECT * FROM xml_cdr WHERE caller_id_number = '" + callernumber + "'" + " and (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge')");
            global.total = callrecorddbx.rows.length;
            let callrecorddb = await client.query("SELECT * FROM xml_cdr WHERE caller_id_number = '" + callernumber + "'" + " and (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge')" + " order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
            callrecorddb.rows.forEach((val) => {
              global.callrecordlist.push(val)
            })
          } else {
          let callrecorddbx = await client.query("SELECT * FROM tl_callrecord WHERE callernumber = '" + callernumber + "'" + " and type= " + filetype + " and (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")");
          global.total = callrecorddbx.rows.length;
          let callrecorddb = await client.query("SELECT * FROM tl_callrecord WHERE callernumber = '" + callernumber + "'" + " and type= " + filetype + " and (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")" + " order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
          callrecorddb.rows.forEach((val) => {
            global.callrecordlist.push(val)
          })
          }
        }
      }
    } else {
      if (calleenumber != '') {
        if (startstamp != '') {
          if (filetype == 1) {
            let callrecorddbx = await client.query("SELECT * FROM xml_cdr WHERE destination_number = " + "'" + calleenumber + "' and start_stamp >= " + "'" +  startstamp + "'" + " and end_stamp <= " + "'" + endstamp + "'" + " and (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge')");
            global.total = callrecorddbx.rows.length;
            let callrecorddb = await client.query("SELECT * FROM xml_cdr WHERE destination_number = " + "'" + calleenumber + "' and start_stamp >= " + "'" +  startstamp + "'" + " and (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge')" + " and end_stamp <= " + "'" + endstamp + "' order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
            callrecorddb.rows.forEach((val) => {
              global.callrecordlist.push(val)
            }) 
          } else {
          let callrecorddbx = await client.query("SELECT * FROM tl_callrecord WHERE calleenumber = " + "'" + calleenumber + "' and start_stamp >= " + "'" +  startstamp + "'" + " and end_stamp <= " + "'" + endstamp + "'" + " and type= " + filetype + " and (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")");
          global.total = callrecorddbx.rows.length;
          let callrecorddb = await client.query("SELECT * FROM tl_callrecord WHERE calleenumber = " + "'" + calleenumber + "' and start_stamp >= " + "'" +  startstamp + "'" + " and type= " + filetype + " and (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")" + " and end_stamp <= " + "'" + endstamp + "' order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
          callrecorddb.rows.forEach((val) => {
            global.callrecordlist.push(val)
          })
          }
        } else {
          if (filetype == 1) {
            let callrecorddbx = await client.query("SELECT * FROM xml_cdr WHERE destination_number = " + "'" + calleenumber + "'" + " and (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge')");
            global.total = callrecorddbx.rows.length;
            let callrecorddb = await client.query("SELECT * FROM xml_cdr WHERE destination_number = " + "'" + calleenumber + "'" + " and (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge')" + " order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
            callrecorddb.rows.forEach((val) => {
              global.callrecordlist.push(val)
            })
          } else {
          let callrecorddbx = await client.query("SELECT * FROM tl_callrecord WHERE calleenumber = " + "'" + calleenumber + "'" + " and type= " + filetype + " and (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")");
          global.total = callrecorddbx.rows.length;
          let callrecorddb = await client.query("SELECT * FROM tl_callrecord WHERE calleenumber = " + "'" + calleenumber + "'" + " and type= " + filetype + " and (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")" + " order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
          callrecorddb.rows.forEach((val) => {
            global.callrecordlist.push(val)
          })
          }
        }
      } else {
        if (startstamp != '') {
          if (filetype == 1) {
            let callrecorddbx = await client.query("SELECT * FROM xml_cdr WHERE start_stamp >= " + "'" +  startstamp + "'" + " and end_stamp <= " + "'" + endstamp + "'" + " and (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge')");
            global.total = callrecorddbx.rows.length;
            let callrecorddb = await client.query("SELECT * FROM xml_cdr WHERE start_stamp >= " + "'" +  startstamp + "'" + " and (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge')" + " and end_stamp <= " + "'" + endstamp + "' order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
            callrecorddb.rows.forEach((val) => {
              global.callrecordlist.push(val)
            })
          } else {
          let callrecorddbx = await client.query("SELECT * FROM tl_callrecord WHERE start_stamp >= " + "'" +  startstamp + "'" + " and type= " + filetype + " and end_stamp <= " + "'" + endstamp + "'" + " and (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")"); 
          global.total = callrecorddbx.rows.length;
          let callrecorddb = await client.query("SELECT * FROM tl_callrecord WHERE start_stamp >= " + "'" +  startstamp + "'" + " and type= " + filetype + " and (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")" + " and end_stamp <= " + "'" + endstamp + "' order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
          callrecorddb.rows.forEach((val) => {
            global.callrecordlist.push(val)
          })
          }
        } else {
          if (filetype == 1) {
            let callrecorddbx = await client.query("SELECT * FROM xml_cdr WHERE" + " (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge')");
            global.total = callrecorddbx.rows.length;
            let callrecorddb = await client.query("SELECT * FROM xml_cdr WHERE" + " (" + "caller_id_number in " + devicecodestr + " or " + "destination_number in " + devicecodestr + ")" + " and (last_app = 'set' or last_app = 'bridge') order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
            callrecorddb.rows.forEach((val) => {
              global.callrecordlist.push(val)
            })
          } else { 
            let callrecorddbx = await client.query("SELECT * FROM tl_callrecord WHERE" + " (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")" + " and type= " + filetype);
            global.total = callrecorddbx.rows.length;
            let callrecorddb = await client.query("SELECT * FROM tl_callrecord WHERE" + " (" + "callerorgid in " + orgiddbstr + " or " + "calleeorgid in " + orgiddbstr + ")" + " and type= " + filetype + " order by start_stamp desc LIMIT " + pagesize +" offset " + (pageindex-1) * pagesize);
            callrecorddb.rows.forEach((val) => {
              global.callrecordlist.push(val)
            })
          }
        }
      }
    } 
    total = global.total 
    let result = await client.query("SELECT * FROM tl_callrecord WHERE callernumber = " + "'" + callernumber + "'");
    let resultlist = global.callrecordlist; 
    console.log(resultlist)
    resultlist.forEach((val) => {
      console.log(val)
      let date = new Date(val.start_stamp)
      let year = date.getUTCFullYear() 
      let month =  date.getUTCMonth()+1 
      let day = date.getDate()
      let hour =  date.getHours() 
      let minute = date.getMinutes()
      let second = date.getSeconds()
      let time = year + '-' + String(month >9?month:("0"+month)) + '-' + String(day >9?day:("0"+day)) + ' ' +  String(hour >9?hour:("0"+hour)) + ':' + String(minute >9?minute:("0"+minute)) + ':' + String(second >9?second:("0"+second)) 
      val.startstamp = time 
      let datex = new Date(val.end_stamp)
      let yearx = date.getUTCFullYear()
      let monthx =  date.getUTCMonth()+1
      let dayx = date.getDate()
      let hourx =  date.getHours()
      let minutex = date.getMinutes()
      let secondx = date.getSeconds()
      let timex = yearx + '-' + String(monthx >9?monthx:("0"+monthx)) + '-' + String(dayx >9?dayx:("0"+dayx)) + ' ' +  String(hourx >9?hourx:("0"+hourx)) + ':' + String(minutex >9?minutex:("0"+minutex)) + ':' + String(secondx >9?secondx:("0"+secondx))
      val.endstamp = timex
    })
    let res = {total, resultlist};
    this.ctx.body = res 
    client.end()
  }
    async detail(){
    const client = await new Client({
          user: 'freeswitch',
          host: '127.0.0.1',
          database: 'ipbc',
          password: 'y2u4evam',
          port: 5432,
    }) 
    let callid = this.ctx.request.body.callid
    let text = this.ctx.request.body.text
    client.connect()
    this.ctx.body = await client.query("update tl_callrecord set  description = " + "'" +text + "'" + " where callid = " + "'" + callid +"'") 
    client.end()
     
  }
}
module.exports = CallrecordController;
