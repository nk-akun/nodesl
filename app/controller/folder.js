"use strict";

const Controller = require("egg").Controller;
const PgClient = require("./config");

class FolderController extends Controller {
  async folderMediaCreate() {
    let folderId = this.ctx.request.body.FolderID;
    let mediaId = this.ctx.request.body.MediaID;

    // console.log(this.ctx.request.header);
    console.log(this.ctx.request.body);

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
      "insert into tr_folder_media values(" + folderId + "," + mediaId + ")"
    );

    console.log(dataResult);

    // 信息补充
    let data = dataResult;
    this.ctx.body = data;
  }
}

module.exports = FolderController;
