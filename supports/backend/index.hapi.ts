import Hapi from "@hapi/hapi";
import hapiInert from "@hapi/inert";
import path from "path";

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "0.0.0.0",
    routes: {
      ...(process.env.NODE_ENV !== "production" && {
        cors: {
          origin: ["*"],
        },
      }),

      //serve static assets if in production
      ...(process.env.NODE_ENV === "production" && {
        files: {
          relativeTo: path.join(__dirname, "client"),
        },
      }),
    },
  });

  await server.register(hapiInert);

  server.route({
    method: "GET",
    path: "/test",
    handler: (request, h) => {
      return "Hello World!";
    },
  });

  //serve static assets if in production
  if (process.env.NODE_ENV === "production") {
    console.log("serving static file for production use");
    server.route({
      method: "GET",
      path: "/{param*}",
      handler: {
        directory: {
          path: ".",
          index: ["index.html"],
        },
      },
    });
  }

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
