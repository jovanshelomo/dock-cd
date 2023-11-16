#! /usr/bin/env node
import yargs from 'yargs';
import inquirer from 'inquirer';
import LogHelper from './logHelper.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { Worker } from 'worker_threads';
import chalk from 'chalk';
import fs from 'fs';

const logHelper = new LogHelper();

const __filename = fileURLToPath(import.meta.url);
const moduleDir = path.dirname(__filename);

const userDir = process.cwd();


inquirer.prompt([
    {
        type: 'input',
        name: 'projectName',
        message: 'Project Name:',
        default: 'my-project',
    },
    {
        type: 'confirm',
        name: 'typescript',
        message: 'Use TypeScript?',
        default: true
    },
    {
        type: 'list',
        name: 'frontend',
        message: 'Select Frontend Framework',
        choices: [
            {
                name: 'Vanilla',
                value: 'vanilla',
            },
            {
                name: 'Vue',
                value: 'vue'
            },
            {
                name: 'React',
                value: 'react'
            },
            {
                name: 'React with SWC',
                value: 'react-swc'
            },
            {
                name: 'Preact',
                value: 'preact'
            },
            {
                name: 'Lit',
                value: 'lit'
            },
            {
                name: 'Svelte',
                value: 'svelte'
            },
            {
                name: 'Solid',
                value: 'solid'
            },
            {
                name: 'Qwik',
                value: 'qwik'
            },
        ]
    }, {
        type: 'list',
        name: 'backend',
        message: 'Select Backend Framework',
        choices: [
            {
                name: 'Express',
                value: 'express'
            },
            {
                name: 'Fastify',
                value: 'fastify'
            },
            {
                name: 'Hapi',
                value: 'hapi'
            },
        ]
    }, {
        type: "list",
        name: "database",
        message: "Select Database",
        choices: [
            {
                name: "MongoDB",
                value: "mongodb"
            },
            {
                name: "PostgreSQL",
                value: "postgresql"
            },
            {
                name: "MariaDB",
                value: "mariadb"
            },
        ]
    }
]).then(answers => {
    // check if project folder already exists
    const projectFolder = userDir + "/" + answers.projectName
    if (fs.existsSync(projectFolder)) {
        console.log(chalk.redBright("Cannot create project. Folder with the same name already exists!"))
        return;
    }

    logHelper.setTotalSteps(answers.typescript ? 17 : 15);
    logHelper.start();

    const worker = new Worker(moduleDir + "/worker.js", { workerData: { answers } })
    worker.on("message", message => {
        if (message === true) {
            logHelper.stop();

            // FINAL
            console.log("\n\nDone creating project!")
            console.log("To start developing, run:")
            console.log(chalk.greenBright(`cd ${answers.projectName}`))
            console.log(chalk.greenBright(`docker-compose up db -d`))
            console.log(chalk.greenBright(`npm i && npm run install-all && npm run dev`))
            console.log("\nTo deploy, run:")
            console.log(chalk.greenBright(`cd ${answers.projectName}`))
            console.log(chalk.greenBright(`docker-compose up -d --build`))
            console.log("\nHappy deploying!")
        } else {
            logHelper.nextProcess(message);
        }
    })
});