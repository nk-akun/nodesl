const Controller = require('egg').Controller
const { Pool, Client } = require('pg')

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 20 (also configurable)

class AlarmControlController extends Controller {
  async index() {
    this.data = ""
    const client = new Client({
      user: 'freeswitch',
      host: '127.0.0.1',
      database: 'ipbc',
      password: 'y2u4evam',
      port: 5432,
    })
    // the pool with emit an error on behalf of any idle clients
    // it contains if a backend error or network partition happens
      client.connect()
    // callback - checkout a client
      let organizationid = this.ctx.params.organizationid
      let _this = this;
      let  data = await client.query("SELECT * from ti_organization where organizationid = " + "'" + organizationid + "'")
      //.then((res)=>{
      //  this.data = res.rows
        client.end()
      //})
      let ret = {}
      ret.alarm_control = data.rows[0].alarm_control
      this.ctx.body = ret 

  }
  async update(){
    const client = new Client({
      user: 'freeswitch',
      host: '127.0.0.1',
      database: 'ipbc',
      password: 'y2u4evam',
      port: 5432,
    })
    client.connect()
    let organizationid = this.ctx.params.organizationid
    let  data = await client.query("update ti_organization set alarm_control = " + "'" + this.ctx.request.body.alarm_control +"'"+" where organizationid = " + "'" + organizationid + "'")
    this.ctx.body = {msg:"更新alarm_control成功",data:this.ctx.request.body.alarm_control}
    this.ctx.status = 200;
    client.end()
  }
  async getMessage(){
    const client = new Client({
      user: 'freeswitch',
      host: '127.0.0.1',
      database: 'ipbc',
      password: 'y2u4evam',
      port: 5432,
    })
    client.connect()
    let organizationid = this.ctx.request.body.organizationid
    let data = {result:{},code:0}
    if(organizationid!=undefined && organizationid!=""){
      let alarm_message_devicesdb = await client.query(`select alarm_message_devices from ti_organization where organizationid = '${organizationid}'`)
      if(alarm_message_devicesdb.rows.length>0){
        let alarm_message_devices = alarm_message_devicesdb.rows[0].alarm_message_devices
        data.result.alarm_message_devices = alarm_message_devices == null ? "" :alarm_message_devices
        data.code = 1
      }
    }
    else{
      data.result = "请求参数错误请重新输入"
      data.code = 0
    }
    this.ctx.body = data
    client.end()
  }
  async updateMessage(){
    const client = new Client({
      user: 'freeswitch',
      host: '127.0.0.1',
      database: 'ipbc',
      password: 'y2u4evam',
      port: 5432,
    })
    client.connect()
    let organizationid = this.ctx.request.body.organizationid
    let text = this.ctx.request.body.text
    let data = {result:"",code:0}
    if(organizationid!=undefined && text!=undefined && organizationid!=""){
      let alarm_message_devicesdb = await client.query(`update ti_organization set alarm_message_devices = '${text}' where organizationid = '${organizationid}'`)
      if(alarm_message_devicesdb.rowCount>0){
        data.result =  alarm_message_devicesdb.rowCount
        data.code = 1
      }
    }
    else{
      data.result = "数据库录入失败"
      data.code = 0
    }
    this.ctx.body = data
    client.end()
  }
}

module.exports = AlarmControlController;
