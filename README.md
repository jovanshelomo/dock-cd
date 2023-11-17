# **Dock-CD ⚡🐋**
<a href="https://npmjs.com/package/vite"><img src="https://img.shields.io/npm/v/dock-cd.svg" alt="npm package"></a>
## **Docker Create & Deploy**

> Dockerized Full Stack Web Application (frontend, backend, and database) Project Generator. Create and Deploy your Full Stack Web Application in minutes.

Dock-CD is a fullstack CLI tool that helps you to create and deploy your fullstack web application in minutes. It is dockerized, so you don't need to worry about deployment. It is also easy to use, you just need to select your tech stacks and the project will be generated automatically.

Dock-CD consists of 3 major parts:

- **Frontend**, which is built with [Vite](https://vitejs.dev/)
- **Backend**, which is built with [Express.js](https://expressjs.com/), [Fastify](https://fastify.dev/), or [Hapi](https://hapi.dev/)
- **Database**, which is built with [MongoDB](https://www.mongodb.com/), [MariaDB](https://mariadb.org/), or [PostgreSQL](https://www.postgresql.org/) Docker image

## Features

- 💡Easy to use
- 🐋Dockerized (no need to worry about deployment)

## Usage

```bash
$ npx dock-cd@latest
```

You will be prompted to enter your project name and choose your tech stacks. Then, the project will be generated automatically in the current directory.

Example prompts:

 ![image](https://github.com/jovanshelomo/dock-cd/assets/15062364/e0a8d9ff-830f-4c82-83c0-b124d7b57e2a)


## After Project Generation

The generated project will be in this directory structure:

```
project-name
├── backend
│   ├── prisma
│   │   └── schema.prisma
│   ├── package.json
│   ├── index.[js,ts]
│   ├── prisma.[js,ts]
│   ├── .env
│   └── ...
├── frontend
│   ├── public
│   │   └── ...
│   ├── src
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   ├── vite.config.[js,ts] (except vanilla or lit)
│   └── ...
├── docker-compose.yml
├── Dockerfile
├── .env
└── package.json
```

---

To start developing, run:

```bash
$ cd [project-name]
$ docker-compose up db -d
$ npm i && npm run install-all && npm run dev
```

The port **5173** will be used for the frontend and **3000** for the backend.

To change the frontend port, you can change the port from vite.config.[js,ts] file.

```javascript
export default defineConfig({
  // ...other configs
  server: {
    port: 3001, // change this port
  },
});
```

To change the backend port, you can change the port from `backend/index.[js,ts]` file. Don't forget, if you are using non vanilla or lit version of the frontend, you also need to change the proxy port in `vite.config.[js,ts]` file.

```javascript
export default defineConfig({
  proxy: {
    "/api": {
      target: "http://localhost:3000", // change this port
      changeOrigin: true,
    },
  },
  // ...other configs
});
```

---

To deploy, run:

```bash
$ cd [project-name]
$ docker-compose up -d --build
```

The frontend will be served as static files from the backend and will be exposed in the default port, **3000**. If you want to serve it in another port, you can change the port from the `.env` file.

> [!WARNING]
> Before actually deploying it to the server, you need to change the database password both in the `.env` and `backend/.env` file.

## Tech Stacks

- Frontend
  - [Vite](https://vitejs.dev/) (thanks for providing the best frontend tooling)
- Backend
  - [Express.js](https://expressjs.com/)
  - [Fastify](https://fastify.dev/)
  - [Hapi](https://hapi.dev/)
- Database
  - [MongoDB](https://www.mongodb.com/)
  - [MariaDB](https://mariadb.org/)
  - [PostgreSQL](https://www.postgresql.org/)
- Containerization
  - [Docker](https://www.docker.com/)
  - [Docker Compose](https://docs.docker.com/compose/)

---
Made with ♥️ By Jovan Shelomo
