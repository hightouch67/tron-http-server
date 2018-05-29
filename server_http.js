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
                        },
                        "getTokens" : {
                            type : "GET"
                        }


                    }
                }
            }, null, 2));
        });

        /*********************************************
         * ***************** GRPC ********************
         ********************************************/

        app.get('/grpc/getLastBlock', async (req, res) => {
            let blockProto = await rpc.getNowBlock();
            let serializedBase64 = tools.utils.base64EncodeToString(blockProto.serializeBinary());
            res.send(serializedBase64);
        });

        app.get('/grpc/listWitnesses', async (req, res) => {
            let witnessesProto = await rpc.listWitnesses();
            let serializedBase64 = tools.utils.base64EncodeToString(witnessesProto.serializeBinary());
            res.send(serializedBase64);
        });

        app.get('/grpc/getAccount', async (req, res) => {
            let accountRaw = await rpc.getAccount(req.query.address);
            let serializedBase64 = tools.utils.base64EncodeToString(accountRaw.serializeBinary());
            res.send(serializedBase64);
        });

        app.get('/grpc/getTransactionsToThis', async (req, res) => {
            let transactionsRaw = await rpc.getTransactionsToThis(req.query.address);
            let serializedBase64 = tools.utils.base64EncodeToString(transactionsRaw.serializeBinary());
            res.send(serializedBase64);
        });

        app.get('/grpc/getTransactionsFromThis', async (req, res) => {
            let transactionsRaw = await rpc.getTransactionsFromThis(req.query.address);
            let serializedBase64 = tools.utils.base64EncodeToString(transactionsRaw.serializeBinary());
            res.send(serializedBase64);
        });

        app.post('/grpc/broadcastTransaction', async (req, res) => {
            let responseRaw = await rpc.broadcastBase64EncodedTransaction(req.body.transaction);
            let serializedBase64 = tools.utils.base64EncodeToString(responseRaw.serializeBinary());
            res.send(serializedBase64);
        });

        /*********************************************
         ************ API USING OUR DB ***************
         ********************************************/

        app.get('/getLastBlock', async (req, res) => {
            let lastBlock = await this.db.getLastBlock().catch(x => null);
            res.send(lastBlock);
        });

        app.get('/getAccount', async (req, res) => {
            let account = await this.db.getAccount(req.query.address).catch(x => null);

            if(account !== null){
                let accountRaw = await rpc.getAccount(req.query.address);
                let accountNet = await rpc.getAccountNet(req.query.address);
                accountRaw = accountRaw.toObject();
                accountNet = accountNet.toObject();

                /*use node info for now*/
                account.tokens = {};
                for(let i = 0;i<accountRaw.assetMap.length;i++){
                    account.tokens[accountRaw.assetMap[i][0]] = accountRaw.assetMap[i][1];
                }
                account.trx = accountRaw.balance;
                account.frozen_balance= 0;
                account.frozen_expire_time = 0;
                if(accountRaw.frozenList.length > 0){
                    account.frozen_balance= accountRaw.frozenList[0].frozenBalance;
                    account.frozen_expire_time= accountRaw.frozenList[0].expireTime;
                }
                account.net = accountNet;
            }

            res.send(account);
        });

        app.get('/getAccountByName', async (req, res) => {
            let account = await this.db.getAccountByName(req.query.name).catch(x => null);
            if(account == null)
                res.status(404);
            res.send(account);
        });

        app.get('/getAccounts', async (req, res) => {
            let addresses = req.query.addresses.split(",");
            let accounts = {};
            for(let i = 0;i<addresses.length;i++){
                accounts[addresses[i]] = await this.db.getAccount(addresses[i]).catch(x => null);
            }
            res.send(accounts);
        });

        app.get('/getTransactionsToThis', async (req, res) => {
            let transactions = await this.db.getContractsToThis(req.query.address).catch(x => null);
            res.send(transactions);
        });

        app.get('/getTransactionsFromThis', async (req, res) => {
            let transactions = await this.db.getContractsFromThis(req.query.address).catch(x => null);
            res.send(transactions);
        });

        app.get('/getTransactionsRelatedToThis', async (req, res) => {
            let transactions = await this.db.getContractsRelatedToThis(req.query.address).catch(x => null);
            res.send(transactions);
        });

        app.get('/getTokens', async (req, res) => {
            let tokens = await this.db.getTokens().catch(x => null);
            res.send(tokens);
        });


        app.listen(config.port);
    }

}