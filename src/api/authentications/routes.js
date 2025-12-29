const routes = (handler) => [
  {
    method: "post",
    path: "/login",
    handler: handler.loginHandler,
  },
  {
    method: "post",
    path: "/refresh",
    handler: handler.refreshTokenVerifyHandler,
  },
];

module.exports = routes;
