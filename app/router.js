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
  router.post(
    "/watcher/left/:organizationid",
    controller.watcherState.activate_left
  );
  router.post(
    "/watcher/right/:organizationid",
    controller.watcherState.activate_right
  );
  router.post(
    "/watcher/out/:organizationid",
    controller.watcherState.activate_out
  );
  router.post(
    "/watcher/update/left/:organizationid",
    controller.watcher.update_left
  );
  router.post(
    "/watcher/update/right/:organizationid",
    controller.watcher.update_right
  );
  router.post(
    "/watcher/update/out/:organizationid",
    controller.watcher.update_out
  );

  router.post("/task/update/:planid", controller.task.update);
  router.get("/file/download/:callid", controller.file.index);
  router.post("/Plan/List", controller.plan.list); // 广播预约列表,TODO: fix
  router.post("/IpBc/Plan/Create", controller.plan.create); // 广播预约
  router.post("/IpBc/Plan/RemoveList", controller.plan.removeList); // 广播预约
  router.get("/Plan/Folders/:planid", controller.plan.folder);
  router.get("/Plan/Devices/:planid", controller.plan.device);

  router.get("/IpBc/User/Login", controller.user.login);
  router.post("/IpBc/User/Create", controller.user.create);
  router.post("/IpBc/User/List", controller.user.list);
  router.get("/IpBc/User/Detail/:userid", controller.user.detail);
  router.put("/IpBc/User/Edit", controller.user.edit);
  router.delete("/IpBc/User/Remove/:userid", controller.user.remove);
  router.get("/IpBc/Role/List", controller.role.list);
  router.post("/IpBc/Role/List", controller.role.list);
  router.delete("/IpBc/Role/Remove/:roleid", controller.role.remove);
  router.delete(
    "/IpBc/Organization/Remove/:organizationid", // TODO: test
    controller.organize.remove
  );
  router.get(
    "/IpBc/Organization/Detail/:organizationid",
    controller.organize.queryDetail
  );
  router.get(
    "/IpBc/Organization/Data/:organizationid",
    controller.organize.queryData
  );
  router.post("/IpBc/FolderMedia/Create", controller.folder.folderMediaCreate);
  router.post("/IpBc/Folder/Create", controller.folder.folderCreate);
  router.post("/IpBc/Folder/Edit", controller.folder.folderEdit);
  router.delete(
    "/IpBc/Folder/Remove/:folderid",
    controller.folder.folderRemove // TODO: test
  );
  router.post("/IpBc/Device/Create", controller.device.create);

  router.get("/alarm_control/:organizationid", controller.alarmControl.index);
  router.post(
    "/alarm_control/update/:organizationid",
    controller.alarmControl.update
  );
  router.post("/alarm_message/update", controller.alarmControl.updateMessage);
  router.post("/alarm_message/get", controller.alarmControl.getMessage);
  router.post("/IpBc/DeviceGroup/Create", controller.deviceGroup.create);
  router.delete("/IpBc/DeviceGroup/Remove", controller.deviceGroup.remove);
  router.post(
    "/IpBc/DeviceGroup/RemoveList",
    controller.deviceGroup.removeList
  );
  router.get(
    "/DeviceGroup/Detail/:devicegroupid",
    controller.deviceGroup.detail
  );
  router.post("/IpBc/DeviceGroup/List", controller.deviceGroup.list);
  router.post("/Conference/Detail", controller.deviceGroup.conf);
  router.get("/Role/getDeviceGroup/:roleid", controller.deviceGroup.role);
  router.get("/Organization/getDeviceGroup/:orgid", controller.deviceGroup.org);
  router.get("/kbs_wc/:testid", controller.hello.index);
  router.post(
    "/IpBc/Device/CreateMulticast",
    controller.device.create_multicast
  );
  router.post("/IpBc/Device/Deletes", controller.device.deletes);
  router.get("/IpBc/Device/Detail/:deviceid", controller.device.detail);
  router.post("/IpBc/Device/All", controller.device.all);
  router.post("/IpBc/Device/Vertos", controller.device.vertos);
  router.post("/IpBc/Callrecord/Create", controller.callrecord.index);
  router.post(
    "/IpBc/Callrecord/List/:organizationid/:filetype",
    controller.callrecord.list
  );
  router.post("/IpBc/Callrecord/Description", controller.callrecord.detail);
  router.post(
    "/IpBc/Feature/getFeatureByOrg/:organizationid",
    controller.feature.getFeatureByOrg
  );
  router.get(
    "/IpBc/Feature/getFeatureByOrg/:organizationid",
    controller.feature.getFeatureByOrg
  );
  //   router.post("/IpBc/Folder/getTreeFiles", controller.folder.folderEdit);
  //   router.post("/IpBc/File/RemoveList", controller.folder.folderEdit);
  //   router.post("/IpBc/File/PreviewText", controller.folder.folderEdit);
  //   router.post("/IpBc/File/UploadText", controller.folder.folderEdit);
  //   router.post("/IpBc/File/UploadFiles", controller.folder.folderEdit);
  //   router.post("/IpBc/File/List", controller.folder.folderEdit);
  //   router.post(
  //     "/IpBc/Basic/Create/DeviceGroup/List",
  //     controller.folder.folderEdit
  //   );
  //   router.post("/IpBc/Basic/Create", controller.folder.folderEdit);
  //   router.post("/IpBc/Basic/List", controller.folder.folderEdit);
};
