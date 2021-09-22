"use strict";

const Controller = require("egg").Controller;
const PgClient = require("./config");
const { Date, GetRandomId } = require("./utils");

class FolderController extends Controller {
  async folderMediaCreate() {
    let params = JSON.parse(this.ctx.request.body);
    let folderId = params.FolderID;
    let mediaId = params.MediaID;

    let numResult = await PgClient.query(
      "select count(*) from tr_folder_media where folderid = " +
        "'" +
        folderId +
        "'" +
        "and mediaid = " +
        "'" +
        mediaId +
        "'"
    );
    let num = numResult.rows[0].count;
    if (num > 0) {
      // 说明已存在
      this.ctx.body = "the record has exist!";
      return;
    }

    let dataResult = await PgClient.query(
      "insert into tr_folder_media values(" +
        "'" +
        folderId +
        "'" +
        "," +
        "'" +
        mediaId +
        "'" +
        ")"
    );

    // 信息补充
    let data = dataResult.rowCount;
    this.ctx.body = data;
  }

  async folderCreate() {
    let params = JSON.parse(this.ctx.request.body);
    let folderId = params.folderid;
    let foldername = params.foldername;
    let userid = params.userid;

    // 判断是否已存在
    let numResult = await PgClient.query(
      "select count(*) from tl_folder where foldername = " +
        "'" +
        foldername +
        "'" +
        "and userid = " +
        "'" +
        userid +
        "'"
    );
    let num = numResult.rows[0].count;
    if (num > 0) {
      // 说明已存在
      this.ctx.body = "the record has exist!";
      return;
    }

    // 生成随机id
    if (folderId == "") {
      folderId = GetRandomId();
    }
    // console.log(folderId, foldername, userid);
    // 生成当前时间
    let createTime = new Date().Format("yyyy-MM-dd HH:mm:ss");
    console.log(createTime);
    let dataResult = await PgClient.query(
      "insert into tl_folder values(" +
        "'" +
        folderId +
        "'" +
        "," +
        "'" +
        foldername +
        "'" +
        "," +
        "'" +
        userid +
        "'" +
        "," +
        "'" +
        createTime +
        "'" +
        ")"
    );

    // 信息补充
    let data = dataResult.rowCount;
    this.ctx.body = data;
  }

  async folderEdit() {
    let params = JSON.parse(this.ctx.request.body);
    let folderId = params.folderid;
    let foldername = params.foldername;
    let userid = params.userid;

    console.log(folderId, foldername, userid);

    if (folderId == "") {
      this.ctx.body = "the record do not exist!";
      return;
    }

    // 判断是否存在此folderId
    let numResult = await PgClient.query(
      "select count(*) from tl_folder where folderid = " + "'" + folderId + "'"
    );
    let num = numResult.rows[0].count;
    if (num == 0) {
      // 说明不存在
      this.ctx.body = "the record do not exist!";
      return;
    }

    let dataResult = await PgClient.query(
      "update tl_folder set foldername = " +
        "'" +
        foldername +
        "'" +
        ",userid = " +
        "'" +
        userid +
        "'" +
        "where folderid = " +
        "'" +
        folderId +
        "'"
    );

    // 信息补充
    let data = dataResult.rowCount;
    this.ctx.body = data;
  }

  async folderRemove() {
    let folderId = this.ctx.params.folderid;

    let numResult = await PgClient.query(
      "select count(*) from tl_folder where folderid = " + "'" + folderId + "'"
    );
    let num = numResult.rows[0].count;
    if (num == 0) {
      // 说明不存在
      this.ctx.body = "the record do not exist!";
      return;
    }

    let dataResult = await PgClient.query(
      "delete from tl_folder where folderid = " + "'" + folderId + "'"
    );

    // 信息补充
    let data = dataResult.rowCount;
    if (data > 0) {
      this.ctx.body = data;
      this.ctx.message = "操作成功";
    } else {
      this.ctx.body = 0;
      this.ctx.message = "操作失败";
    }
  }
}

module.exports = FolderController;
