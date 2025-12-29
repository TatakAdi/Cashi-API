const router = require("express").Router();
const AuthenticationsHandler = require("./handler");
const routes = require("./routes");

module.exports = ({ service, middleware }) => {
  const handler = new AuthenticationsHandler(service);
  const routeDefinitions = routes(handler);

  routeDefinitions.forEach((route) => {
    const middlewares = [];

    if (route.options?.auth) {
      middlewares.push(middleware);
    }

    router[route.method](route.path, ...middlewares, route.handler);
  });

  return router;
};
