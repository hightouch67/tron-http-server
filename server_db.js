const MongoClient = require('mongodb').MongoClient;
const f = require('util').format;

module.exports = class {

    constructor(){

    }

    async connect(config){
        return new Promise((resolve)=> {
            const url = f('mongodb://%s:%s@%s:27017/?authMechanism=%s&authSource=%s',
                config.mongo.username,
                config.mongo.password,
                config.mongo.host,
                config.mongo.auth_mechanism,
                config.mongo.db);

            MongoClient.connect(url, {useNewUrlParser:true},(err, client)=>{
                if(err){
                    console.log(err);
                    throw err;
                }

                this.db = client.db(config.mongo.db);

                console.log('connected to db');
                resolve();
            });
        });
    }

    async getLastBlock(){
        let lastBlock = await this.db.collection('blocks').find({}, {_id:false}).sort({block_id:-1}).limit(1).toArray();
        lastBlock = lastBlock[0];
        return lastBlock;
    }

    async getBlockByNum(num){
        return await this.db.collection('blocks').find({block_id:{$eq:num}}).limit(1).toArray().then(x => x[0]);
    }

    async deleteBlocksStartingAt(start){
        await this.db.collection('blocks').remove({block_id:{$gte:start}});
        await this.db.collection('assets').remove({block_id:{$gte:start}});
        await this.db.collection('contracts').remove({block_id:{$gte:start}});
    }

    async insertBlock(block){
        return await this.db.collection('blocks').insert(block);
    }

    async insertAsset(asset){
        return await this.db.collection('assets').insert(asset);
    }

    async insertContracts(contracts){
        return await this.db.collection('contracts').insert(contracts);
    }

    async getAccounts(addresses){
        return await this.db.collection('accounts').find({address : {$in: addresses}}).toArray();
    }

    async getAccount(address){
        return await this.db.collection('accounts').find({address : {$eq: address}}).toArray().then(x => x[0]);
    }

    async getContractsToThis(address){
        return await this.db.collection('contracts').find({to_address: {$eq: address}}).toArray();
    }

    async getContractsFromThis(address){
        return await this.db.collection('contracts').find({owner_address: {$eq: address}}).toArray();
    }

    /*helper function that clones an object*/
    clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    async insertAccount(a){
        let account = this.clone(a);
        let address = account.address;
        delete account.address;
        await this.db.collection('accounts').update(
            {address : address},
            {$set: account,$setOnInsert: {address : address}},
            {upsert : true});
    }

}