const routes = (handler) => [
  {
    method: "post",
    path: "/",
    handler: handler.registerHandler,
  },
  {
    method: "get",
    path: "/me",
    handler: handler.getUserProfileHandler,
    options: { auth: true },
  },
];
module.exports = routes;
