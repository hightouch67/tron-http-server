const express = require("express");
const bodyParser = require("body-parser");
const tools = require("tron-http-tools");
const RpcClient = require("./rpcclient");

module.exports = class{

    constructor(config){
        console.log(`Starting http server on port ${config.port}`);

        let rpc = new RpcClient(config);
        let app = express();
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
                    },
                    "getLastBlock" : {
                        type : "GET"
                    }
                }
            }, null, 2));
        });

        app.get('/getLastBlock', async (req, res) => {
            let blockProto = await rpc.getNowBlock();
            let serializedBase64 = tools.utils.base64EncodeToString(blockProto.serializeBinary());
            res.send(serializedBase64);
        });

        app.get('/listWitnesses', async (req, res) => {
            let witnessesProto = await rpc.listWitnesses();
            let serializedBase64 = tools.utils.base64EncodeToString(witnessesProto.serializeBinary());
            res.send(serializedBase64);
        });

        app.get('/getAccount', async (req, res) => {
            let accountRaw = await rpc.getAccount(req.query.address);
            let serializedBase64 = tools.utils.base64EncodeToString(accountRaw.serializeBinary());
            res.send(serializedBase64);
        });

        app.get('/getTransactionsToThis', async (req, res) => {
            let transactionsRaw = await rpc.getTransactionsToThis(req.query.address);
            let serializedBase64 = tools.utils.base64EncodeToString(transactionsRaw.serializeBinary());
            res.send(serializedBase64);
        });

        app.get('/getTransactionsFromThis', async (req, res) => {
            let transactionsRaw = await rpc.getTransactionsFromThis(req.query.address);
            let serializedBase64 = tools.utils.base64EncodeToString(transactionsRaw.serializeBinary());
            res.send(serializedBase64);
        });

        app.post('/broadcastTransaction', async (req, res) => {
            let responseRaw = await rpc.broadcastBase64EncodedTransaction(req.body.transaction);
            let serializedBase64 = tools.utils.base64EncodeToString(responseRaw.serializeBinary());
            res.send(serializedBase64);
        });

        app.listen(config.port);
    }

}