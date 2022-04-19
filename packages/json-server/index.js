const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Use to rewrite routes. See: https://www.npmjs.com/package/json-server#rewriter-example
server.use(jsonServer.rewriter({}))

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running');
});
