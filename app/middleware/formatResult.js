module.exports = (options, app) => {
  return async function formatResult(ctx, next) {
    await next();
    let body = ctx.body;
    let succ = true;
    if (ctx.message.includes("失败")) {
      succ = false;
    }
    let result = {};
    if (succ == true) {
      result = {
        result: body,
        code: 1,
        tocket: "",
        message: ctx.message,
      };
    } else {
      result = {
        result: body,
        code: 0,
        tocket: "",
        message: ctx.message,
      };
    }
    ctx.body = result;
  };
};
