const ServerHttp = require("./server_http");
const ServerWebsocket = require("./server_ws");
const config = require("./config.json");

async function run(){
    const http = new ServerHttp(config);
    const ws = new ServerWebsocket(config);
}

run();
