/* eslint valid-jsdoc: "off" */

"use strict";

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {
    security: {
      csrf: {
        enable: false,
      },
    },
    bodyParser: {
      enableTypes: ["json", "form", "text"],
      extendTypes: {
        text: ["text/xml", "application/xml"],
      },
    },
  });

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_1626878717788_4430";

  // add your middleware config here
  config.middleware = ["formatResult"];

  // cors
  config.cors = {
    origin: "*",
    allowMethods: "GET,HEAD,PUT,POST,DELETE,PATCH",
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
