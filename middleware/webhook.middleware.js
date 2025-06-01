export const stripeRawBody = (req, res, next) => {
  if (req.originalUrl === "/webhook") {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      req.rawBody = data;
      next();
    });
  } else {
    next();
  }
};
