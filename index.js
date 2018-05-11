const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config.json");

async function run(){
    var app = express();
    app.use(bodyParser.urlencoded({extended: true}));

    app.get('/', async (req, res) => {
        res.set({'Content-Type': 'application/json; charset=utf-8'});
        res.send(JSON.stringify({
            methods : {
                "listWitnesses" : {
                    type : "GET"
                },
                "getAccount" : {
                    type : "GET",
                    parameters : {
                        address : "base58 encoded Tron address"
                    }
                },
                "getTransactionsToThis" : {
                    type : "GET",
                    parameters : {
                        address : "base58 encoded Tron address"
                    }
                },
                "getTransactionsFromThis" : {
                    type : "GET",
                    parameters : {
                        address : "base58 encoded Tron address"
                    }
                },
                "broadcastTransaction" : {
                    type : "POST",
                    parameters : {
                        transaction : "base64 encoded serialized Transaction protobuf"
                    }
                }
            }
        }, null, 2));
    });

    app.get('/listWitnesses', async (req, res) => {
        res.send("not implemented");
    });

    app.get('/getAccount', async (req, res) => {
        res.send("not implemented");
    });

    app.get('/getTransactionsToThis', async (req, res) => {
        res.send("not implemented");
    });

    app.get('/getTransactionsFromThis', async (req, res) => {
        res.send("not implemented");
    });

    app.post('/broadcastTransaction', async (req, res) => {
        res.send("not implemented");
    });

    app.listen(config.port);
}

run();
