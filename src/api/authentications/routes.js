const routes = (handler) => [
  {
    method: "post",
    path: "/register",
    handler: handler.registerHandler,
  },
  {
    method: "post",
    path: "/login",
    handler: handler.loginHandler,
  },
];

module.exports = routes;
