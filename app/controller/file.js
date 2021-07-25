const Controller = require('egg').Controller
const { Pool, Client } = require('pg')
const fs = require("fs");

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 20 (also configurable)

class FileController extends Controller {
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
      let _this = this;
      let callid = this.ctx.params.callid
      let  data = await client.query("SELECT * from tl_callrecord where callid =" + "'" + callid.split('.')[0] +"'")
      data= data.rows[0]
      let date = new Date(data.startstamp)
      let year = date.getUTCFullYear() 
      let month =  date.getUTCMonth()+1 
      let day = date.getDate()
      let hour =  date.getHours() 
      let minute = date.getMinutes()
      let time = year + String(month >9?month:("0"+month)) + String(day >9?day:("0"+day)) +  String(hour >9?hour:("0"+hour)) + String(minute >9?minute:("0"+minute))  
      let filename = time + '_' + data.uuid.slice(2) 
      let filepath = "/var/lib/tomcat8/webapps/IpBcFiles/recording/" + filename +'.mp3' 
      let stats = fs.statSync(filepath);
      this.ctx.set('content-type', 'audio/mpeg') 
      this.ctx.set('content-type', 'application/force-download')
      let fileData =  fs.createReadStream(filepath)
      this.ctx.body = fileData 
      client.end()
      //})

  }
}
module.exports = FileController
