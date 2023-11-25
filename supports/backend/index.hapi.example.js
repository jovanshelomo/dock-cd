import Hapi from '@hapi/hapi';
import hapiInert from '@hapi/inert';
import path from "path";
import prisma from "./prisma";

const __dirname = path.resolve(path.dirname(""));

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0',
        routes: {
            ...(process.env.NODE_ENV !== 'production' && {
                cors: {
                    origin: ['*'],
                }
            }),

            //serve static assets if in production
            ...(process.env.NODE_ENV === 'production' && {
                files: {
                    relativeTo: path.join(__dirname, 'client')
                }
            })
        }
    });

    await server.register(hapiInert);

    server.route({
        method: 'GET',
        path: '/api/test',
        handler: (request, h) => {
            return 'Hello World!';
        }
    });

    server.route({
        method: 'GET',
        path: '/api/users',
        handler: async (request, h) => {
            const data = await prisma.users.findMany();
            return data;
        }
    })

    //serve static assets if in production
    if (process.env.NODE_ENV === 'production') {
        console.log("serving static file for production use");
        server.route({
            method: 'GET',
            path: '/{param*}',
            handler: {
                directory: {
                    path: '.',
                    index: ['index.html'],
                }
            }
        });
    }


    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();