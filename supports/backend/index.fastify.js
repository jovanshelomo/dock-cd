import fastify from "fastify"
import path from "path";
import fastifyStatic from "@fastify/static";

const __dirname = path.resolve(path.dirname(""));

const server = fastify()

//serve static assets if in production
if (process.env.NODE_ENV === "production") {
    console.log("serving static file for production use");
    server.register(fastifyStatic, {
        root: path.join(__dirname, "client"),
    });
    server.setNotFoundHandler((request, reply) => {
        reply.sendFile("index.html");
    });
}

server.get("/test", async (request, reply) => {
    return "Hello World!"
})

server.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})