const express = require("express");
const bodyParser = require("body-parser");
const tools = require("tron-http-tools");
const RpcClient = require("./rpcclient");

module.exports = class{

    constructor(config, db){
        this.db = db;

        console.log(`Starting http server on port ${config.port}`);

        let rpc = new RpcClient(config);
        let app = express();
        app.use(bodyParser.urlencoded({extended: true}));

        app.get('/', async (req, res) => {
            res.set({'Content-Type': 'application/json; charset=utf-8'});
            res.send(JSON.stringify({
                grpc : {
                    methods : {
                        "grpc/listWitnesses" : {
                            type : "GET"
                        },
                        "grpc/getAccount" : {
                            type : "GET",
                            parameters : {
                                address : "base58 encoded Tron address"
                            }
                        },
                        "grpc/getTransactionsToThis" : {
                            type : "GET",
                            parameters : {
                                address : "base58 encoded Tron address"
                            }
                        },
                        "grpc/getTransactionsFromThis" : {
                            type : "GET",
                            parameters : {
                                address : "base58 encoded Tron address"
                            }
                        },
                        "grpc/broadcastTransaction" : {
                            type : "POST",
                            parameters : {
                                transaction : "base64 encoded serialized Transaction protobuf"
                            }
                        },
                        "grpc/getLastBlock" : {
                            type : "GET"
                        }
                    }
                },

                api : {
                    methods : {
                        "getContractsFrom" : {
                            type : "GET",
                            parameters : {
                                address : "base58 encoded TRON address"
                            }
                        },
                        "getTransactionsFromThis" : {
                            type : "GET",
                            parameters : {
                                address : "base58 encoded TRON address"
                            }
                        },
                        "getTransactionsToThis" : {
                            type : "GET",
                            parameters : {
                                address : "base58 encoded TRON address"
                            }
                        },
                        "getAccount" : {
                            type : "GET",
                            parameters:{
                                address : "base58 encoded TRON address"
                            }
                        }

                    }
                }
            }, null, 2));
        });

        /*********************************************
         * ***************** GRPC ********************
         ********************************************/

        app.get('grpc/getLastBlock', async (req, res) => {
            let blockProto = await rpc.getNowBlock();
            let serializedBase64 = tools.utils.base64EncodeToString(blockProto.serializeBinary());
            res.send(serializedBase64);
        });

        app.get('grpc/listWitnesses', async (req, res) => {
            let witnessesProto = await rpc.listWitnesses();
            let serializedBase64 = tools.utils.base64EncodeToString(witnessesProto.serializeBinary());
            res.send(serializedBase64);
        });

        app.get('grpc/getAccount', async (req, res) => {
            let accountRaw = await rpc.getAccount(req.query.address);
            let serializedBase64 = tools.utils.base64EncodeToString(accountRaw.serializeBinary());
            res.send(serializedBase64);
        });

        app.get('grpc/getTransactionsToThis', async (req, res) => {
            let transactionsRaw = await rpc.getTransactionsToThis(req.query.address);
            let serializedBase64 = tools.utils.base64EncodeToString(transactionsRaw.serializeBinary());
            res.send(serializedBase64);
        });

        app.get('grpc/getTransactionsFromThis', async (req, res) => {
            let transactionsRaw = await rpc.getTransactionsFromThis(req.query.address);
            let serializedBase64 = tools.utils.base64EncodeToString(transactionsRaw.serializeBinary());
            res.send(serializedBase64);
        });

        app.post('grpc/broadcastTransaction', async (req, res) => {
            let responseRaw = await rpc.broadcastBase64EncodedTransaction(req.body.transaction);
            let serializedBase64 = tools.utils.base64EncodeToString(responseRaw.serializeBinary());
            res.send(serializedBase64);
        });

        /*********************************************
         ************ API USING OUR DB ***************
         ********************************************/

        app.listen(config.port);
    }

}