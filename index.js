const ServerHttp = require("./server_http");
const ServerWebsocket = require("./server_ws");
const ServerUpdater = require("./server_updater");
const ServerSql = require("./server_mysql");
const config = require("./config.json");

async function run(){
    const sql = new ServerSql(config);

    //const http = new ServerHttp(config, sql);
    //const ws = new ServerWebsocket(config);
    const updater = new ServerUpdater(config, sql);
}

run();
