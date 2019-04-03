const express = require('express');
const cluster = require('cluster');
const bodyParser = require('body-parser');
const DB = require('./config/database');
const createProblem = require('./routes/problems/postProblems');
const getProblems = require ('./routes/problems/getProblems');
PORT = 3000;
ENV = 'PROD';
const routeInit = (app) => {
    app.use(function (request, response, next) {
        response.header("Access-Control-Allow-Origin", "*");
        response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        response.header("Access-Control-Allow-Credentials", true);
        next();
    });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/createProblem',createProblem);
    app.use('/getProblems',getProblems);

    app.get("/", (req, res) => {
        GATEKEEPER.response(res, 200, JSON.stringify({ Server: "WasP", Port: PORT, Environment: ENV, Version: require("./package.json").version }));
    });
}

const connectDB = () => {
    DB.authenticate()
        .then(() => console.log("Database Connected..."))
        .catch(err => console.log('Error: ' + err))
}

const init = () => {

    if (cluster.isMaster) {
        const numCPUs = require('os').cpus().length;
        console.log(`Master ${process.pid} is running`);

        // Fork workers.
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
        });

    } else {

        var app = express();
        routeInit(app);
        connectDB();
        DB.sync().then(()=>{
            app.listen(PORT,()=>console.log("server listening on port " + PORT + " in " + ENV + " mode version is " + require("./package.json").version));
        })
        app.disable('x-powered-by');
    }
};

init();