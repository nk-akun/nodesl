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
};
