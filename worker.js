import { parentPort, workerData } from "worker_threads"
import { execSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { answers } = workerData

const __filename = fileURLToPath(import.meta.url);
const moduleDir = path.dirname(__filename);
const userDir = process.cwd();

const projectFolder = userDir + "/" + answers.projectName
const backendFolder = userDir + "/" + answers.projectName + "/backend"
const frontendFolder = userDir + "/" + answers.projectName + "/frontend"

const execCommand = ({ cmd, }) => {
  parentPort.postMessage("Running Command: " + cmd)
  return execSync(cmd)
}

const databaseProps = {
  postgresql: {
    user: "postgres",
    port: "5432",
    host: "localhost",
    password: "your-super-secret-and-long-password",
    prismaDataSourceName: "postgresql"
  },
  mongodb: {
    user: "mongodb",
    port: "27017",
    host: "localhost",
    password: "your-super-secret-and-long-password",
    prismaDataSourceName: "mongodb"
  },
  mariadb: {
    user: "mariadb",
    port: "3306",
    host: "localhost",
    password: "your-super-secret-and-long-password",
    prismaDataSourceName: "mysql"
  },
}

// check if folder with same name as project name exists
if (fs.existsSync(projectFolder)) {
  console.log(chalk.redBright("Cannot create project. Folder with the same name already exists!"))
} else {
  parentPort.postMessage("Creating project folder...")
  fs.mkdirSync(projectFolder)

  // FRONTEND
  // console.log(chalk.greenBright("Creating frontend..."))
  execCommand({ cmd: `cd ${projectFolder} && npm create vite@latest frontend -- --template ${answers.frontend + (answers.typescript ? '-ts' : '')}`, inherit: false })

  // modify vite.config.(ts|js) to add proxy for backend (for non vanilla and lit projects)
  if (!["vanilla", "lit"].includes(answers.frontend)) {
    const viteConfig = fs.readFileSync(frontendFolder + "/vite.config" + (answers.typescript ? ".ts" : ".js"), 'utf8')
    const viteConfigWithProxy = viteConfig.replace("export default defineConfig({", `export default defineConfig({
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },`)
    fs.writeFileSync(frontendFolder + "/vite.config" + (answers.typescript ? ".ts" : ".js"), viteConfigWithProxy)
  }

  // BACKEND
  parentPort.postMessage("Creating backend folder...")
  fs.mkdirSync(backendFolder)

  // create & modify package.json to add scripts
  execCommand({
    cmd: `cd ${backendFolder} && npm init -y && npm pkg set ${!answers.typescript ? `type="module" ` : ""}scripts.start="node index.js" ${answers.typescript ?
      `scripts.dev="nodemon index.ts" scripts.build="tsc && (prisma generate || exit 0)" scripts.serve="cross-env NODE_ENV=production node dist/index.js"` :
      `scripts.dev="nodemon index.js" scripts.build="prisma generate || exit 0" scripts.serve="cross-env NODE_ENV=production node index.js"`}`
  })

  // add needed dependencies without installing
  const backendDependencies = {
    express: { dependencies: "express", devDependencies: "@types/express" },
    fastify: { dependencies: "fastify @fastify/cors @fastify/static", devDependencies: "" },
    hapi: { dependencies: "@hapi/hapi @hapi/inert", devDependencies: "" },
  }
  execCommand({
    cmd: `cd ${backendFolder} && npm install --package-lock-only --no-package-lock ${backendDependencies[answers.backend].dependencies} @prisma/client ${answers.database} && npm install --package-lock-only --no-package-lock prisma ${backendDependencies[answers.backend].devDependencies
      } cross-env --save-dev`
  })
  if (answers.typescript) {
    execCommand({ cmd: `cd ${backendFolder} && npm install --package-lock-only --no-package-lock typescript ts-node @types/node --save-dev` })

    // create tsconfig.json & change outDir
    execCommand({ cmd: `cd ${backendFolder} && npx tsc --init --outDir ./dist --esModuleInterop true` })
  }

  //add database to docker-compose
  const dockerComposeDatabases = {
    postgresql: `image: postgres:latest
    environment:
      POSTGRES_USER: \${DATABASE_USER}
      POSTGRES_PASSWORD: \${DATABASE_PASSWORD}
      POSTGRES_DB: postgres
      PGDATABASE: mydb
      PGPASSWORD: \${DATABASE_PASSWORD}
      POSTGRES_PORT: \${DATABASE_PORT}
      PGPORT: \${DATABASE_PORT}
    ports:
      - "\${DATABASE_PORT}:\${DATABASE_PORT}"
    volumes:
      - dockcd:/var/lib/postgresql/data
    restart: unless-stopped`,

    mongodb: `image: mongo:latest
    environment:
      MONGO_INITDB_ROOT_USERNAME: \${DATABASE_USER}
      MONGO_INITDB_ROOT_PASSWORD: \${DATABASE_PASSWORD}
      MONGO_PORT: \${DATABASE_PORT}
      MONGO_INITDB_DATABASE: mydb
    ports:
      - "\${DATABASE_PORT}:\${DATABASE_PORT}"
    volumes:
      - dockcd:/data/db
    restart: unless-stopped`,

    mariadb: `image: mariadb:latest
    environment:
      MYSQL_ROOT_PASSWORD: \${DATABASE_PASSWORD}
      MYSQL_DATABASE: mydb
      MYSQL_USER: \${DATABASE_USER}
      MYSQL_PASSWORD: \${DATABASE_PASSWORD}
      MYSQL_PORT: \${DATABASE_PORT}
    ports:
      - "\${DATABASE_PORT}:\${DATABASE_PORT}"
    volumes:
      - dockcd:/var/lib/mysql
    restart: unless-stopped`
  }

  parentPort.postMessage("Creating docker-compose.yml...")
  let dockerComposeContent = fs.readFileSync(moduleDir + "/supports/docker-compose.yml", 'utf8')
  dockerComposeContent = dockerComposeContent.replace("##DATABASE##", dockerComposeDatabases[answers.database])
  fs.writeFileSync(projectFolder + "/docker-compose.yml", dockerComposeContent)

  // copy .env and change db user & port
  parentPort.postMessage("Creating .env...")
  let dotenvContent = fs.readFileSync(moduleDir + "/supports/.env", 'utf8');
  dotenvContent = dotenvContent.replace("##DATABASE_USER##", databaseProps[answers.database].user)
  dotenvContent = dotenvContent.replace("##DATABASE_PASSWORD##", databaseProps[answers.database].password)
  dotenvContent = dotenvContent.replace("##DATABASE_PORT##", databaseProps[answers.database].port)
  fs.writeFileSync(projectFolder + "/.env", dotenvContent)

  // init prisma into backend
  parentPort.postMessage("Initializing prisma...")
  execCommand({
    cmd: `cd ${backendFolder} && npx prisma init --datasource-provider ${databaseProps[answers.database].prismaDataSourceName}`,
  })
  let dotenvPrismaContent = fs.readFileSync(backendFolder + "/.env", 'utf8');
  dotenvPrismaContent = dotenvPrismaContent.replace(/DATABASE_URL=.+/, `DATABASE_URL="${databaseProps[answers.database].prismaDataSourceName
    }://${databaseProps[answers.database].user}:${databaseProps[answers.database].password}@${databaseProps[answers.database].host}:${databaseProps[answers.database].port}/mydb${answers.database === "postgresql" ? "?schema=public" : ""
    }"`)
  fs.writeFileSync(backendFolder + "/.env", dotenvPrismaContent)

  let prismaSchemaContent = fs.readFileSync(backendFolder + "/prisma/schema.prisma", 'utf8');
  prismaSchemaContent = prismaSchemaContent.replace("DATABASE_URL", `env("DATABASE_URL")`)

  fs.copyFileSync(moduleDir + "/supports/backend/prisma.js", backendFolder + `/prisma.${answers.typescript ? "ts" : "js"}`)

  // copy index.js
  parentPort.postMessage("Creating backend index.js...")
  fs.copyFileSync(moduleDir + `/supports/backend/index.${answers.backend}.${answers.typescript ? "ts" : "js"}`, backendFolder + `/index.${answers.typescript ? "ts" : "js"}`)


  // ROOT

  // create dockerfile
  parentPort.postMessage("Creating dockerfile...")
  fs.copyFileSync(moduleDir + "/supports/Dockerfile", projectFolder + "/Dockerfile")

  // create package.json
  parentPort.postMessage("Creating package.json...")
  execCommand({ cmd: `cd ${projectFolder} && npm init -y` })

  parentPort.postMessage("Editing package.json...")
  const rootPackageJson = JSON.parse(fs.readFileSync(projectFolder + "/package.json", 'utf8'))
  rootPackageJson.scripts = {
    "dev": "npm run dev:db && npm run dev:app",
    "dev:db": "docker-compose up db -d",
    "dev:app": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm run dev\"",
    "install-all": "concurrently \"npm install\" \"cd backend && npm install\" \"cd frontend && npm install\"",
    "build": `cd frontend && npm run build && cd ../backend && npm run build && cd .. && copyfiles -u 2 "frontend/dist/**/*" "${answers.typescript ? "backend/dist/client" : "backend/client"}"`,
    "prisma": "cd backend && npx prisma studio",
    "prisma:generate": "cd backend && npx prisma generate",
    "prisma:pull": "cd backend && npx prisma db pull"
  }
  fs.writeFileSync(projectFolder + "/package.json", JSON.stringify(rootPackageJson, null, 2))

  parentPort.postMessage("Installing dependencies...")
  execCommand({
    cmd: `cd ${projectFolder} && npm install --package-lock-only --no-package-lock concurrently docker-compose ts-node copyfiles --save-dev`
  })

  parentPort.postMessage(true)
}