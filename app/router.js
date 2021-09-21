"use strict";

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller } = app;
  router.get("/", controller.home.index);
  router.get("/organization/:organizationid", controller.watcher.index);
  router.post("/watcher/:organizationid", controller.watcherState.activate);
  router.post("/watcher/update/:organizationid", controller.watcher.update);
  router.post("/task/update/:planid", controller.task.update);
  router.get("/file/download/:callid", controller.file.index);
  router.post("/Plan/List", controller.plan.index);
  router.get("/IpBc/User/Login", controller.user.login);
  router.get("/IpBc/Role/List", controller.role.list);
  router.delete("/IpBc/Role/Remove/:roleid", controller.role.remove);
  //   router.get(
  //     "/IpBc/Organization/Remove/:organizationid",
  //     controller.organize.query
  //   );
  router.get(
    "/IpBc/Organization/Data/:organizationid",
    controller.organize.query
  );
  router.post("/IpBc/FolderMedia/Create", controller.folder.folderMediaCreate);
  router.post("/IpBc/Folder/Create", controller.folder.folderCreate);
  router.post("/IpBc/Folder/Edit", controller.folder.folderEdit);
  //   router.post("/IpBc/Folder/Remove", controller.folder.folderEdit);
  //   router.post("/IpBc/File/RemoveList", controller.folder.folderEdit);
  //   router.post("/IpBc/File/PreviewText", controller.folder.folderEdit);
  //   router.post("/IpBc/File/UploadText", controller.folder.folderEdit);
  //   router.post("/IpBc/File/UploadFiles", controller.folder.folderEdit);
  //   router.post("/IpBc/File/List", controller.folder.folderEdit);
  //   router.post("/IpBc/DeviceGroup/List", controller.folder.folderEdit);
  //   router.post("/IpBc/Device/RemoveList", controller.folder.folderEdit);
  //   router.post(
  //     "/IpBc/Basic/Create/DeviceGroup/List",
  //     controller.folder.folderEdit
  //   );
  //   router.post("/IpBc/Basic/Create", controller.folder.folderEdit);
  //   router.post("/IpBc/Basic/List", controller.folder.folderEdit);
  //   router.post("/IpBc/Folder/getTreeFiles", controller.folder.folderEdit);
};
