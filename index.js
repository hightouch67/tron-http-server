const ServerHttp = require("./server_http");
const ServerWebsocket = require("./server_ws");
const ServerUpdater = require("./server_updater");
const ServerDb = require("./server_db");
const config = require("./config.json");

async function run(){
    const db = new ServerDb();
    await db.connect(config)

    //const http = new ServerHttp(config, sql);
    //const ws = new ServerWebsocket(config);
    const updater = new ServerUpdater(config, db);
}

run();
