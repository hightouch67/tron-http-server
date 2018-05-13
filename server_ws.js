const WebSocket = require("ws");

module.exports = class{

    constructor(config){
        console.log(`Starting websocket server on port ${config.port_ws}`);
        this.wss = new WebSocket.Server({port: config.port_ws});
        this.wss.on('connection', this.onConnection);
    }

    onConnection(ws){
        console.log('somebody connected');
    }
}