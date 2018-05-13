const WebSocket = require("ws");
const axios = require("axios");

const CMC_API_TRX_ID = 1958; //https://api.coinmarketcap.com/v2/listings/
const CMC_API_URL = `https://api.coinmarketcap.com/v2/ticker/${CMC_API_TRX_ID}/?convert=USD`;
const PRICE_UPDATING_INTERVAL = 60000;

module.exports = class{
    constructor(config){
        console.log(`Starting websocket server on port ${config.port_ws}`);
        this.wss = new WebSocket.Server({port: config.port_ws});
        this.wss.on('connection', this.onConnection);
        this.updatePrice(true);

        this.lastPrice = null;
        this.connectedClients = new Array();
    }

    onConnection(ws){
        console.log('client connected');
        this.sendPrice(ws);
        this.connectedClient.push(ws);
    }

    sendPrice(ws){
        ws.send(this.lastPrice);
    }

    broadcastPrice(){
        console.log(`broadcasting price to ${this.connectedClients.length} clients`);
        for(var i = this.connectedClients.length -1; i>=0 ;i--){
            let ws = this.connectedClients[i];
            if (client.readyState === WebSocket.OPEN) {
                this.sendPrice(ws);
            }else{
                this.connectedClients.splice(i, 1);
            }
        }
    }

    async updatePrice(repeat){
        console.log("fetching price");
        let price = await axios.get(CMC_API_URL).then(x => x.data);

        if(price && price.data && price.data.name == 'TRON' && price.data.last_updated > 0){
            this.lastPrice = JSON.stringify({
                symbol : price.data.symbol,
                USD : price.data.quotes.USD
            });
            this.broadcastPrice();
        }

        if(repeat){
            setTimeout(() => {this.updatePrice(repeat)}, PRICE_UPDATING_INTERVAL);
        }
    }
}