module.exports = function (app) {
  app.use("/api", (req, resp, next) => {
    resp.send("hello");
  });
};
