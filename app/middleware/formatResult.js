module.exports = (options, app) => {
  return async function formatResult(ctx, next) {
    await next();
    let body = ctx.body;
    let succ = true;
    // TODO: fail添加
    let result = {};
    if (succ == true) {
      result = {
        result: body,
        code: 1,
        tocket: "",
      };
      if (ctx.get("code") != null) {
        result.code = ctx.get("code");
      }
      if (ctx.message != "") {
        result.message = ctx.message;
      }
    }
    ctx.body = result;
  };
};
