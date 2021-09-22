const Controller = require('egg').Controller;
const dgram = require('dgram')
const server1 = dgram.createSocket('udp4');
const multicastAddr = '239.220.0.10'
const { Pool, Client} = require('pg')
class HelloController extends Controller {
  async index() {
    const client = new Client({
      user: 'freeswitch',
      host: '127.0.0.1',
      database: 'ipbc',
      password: 'y2u4evam',
      port: 5432, 
    })
    client.connect() 
    let id = this.ctx.params.testid
    let arr = id.split('|')
    arr.forEach(async (s) => {
      let order = await client.query("SELECT * from zubo where dianum = " + "'" + s + "'")
      order.rows.forEach((v) => {
        let resultArr = [175, 175, 175, 175]
        resultArr.push(0) 
        resultArr.push(0)
        resultArr.push(0)
        resultArr.push(0)
        resultArr.push(246)
        resultArr.push(136)
        resultArr.push(parseInt(v.camnum)/256)
        resultArr.push(v.camnum)
        resultArr.push(v.obnum)
        resultArr.push(0)
        resultArr.push((136+parseInt(v.camnum)+parseInt(v.obnum))%128) 
        console.log(Buffer.from(resultArr))
        server1.send(Buffer.from(resultArr), 2001, multicastAddr)
        server1.send(Buffer.from(resultArr), 2001, multicastAddr)
      })
    }) 
    let data = {}
    let code = 1 
    data = {result:id,code:code}
    this.ctx.body = data 

  }
}

module.exports = HelloController;
