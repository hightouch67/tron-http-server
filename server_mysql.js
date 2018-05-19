var mysql = require('mysql');

module.exports = class {

    constructor(config){
        this.pool = mysql.createPool(config.sql);
    }

    query(queryStr,params=[]){
        return new Promise((resolve, reject)=>{
            this.pool.query(queryStr, params, function (error, results, fields) {
                if (error){
                    console.log(error);
                    reject(error);
                }else{
                    resolve(results, fields);
                }
            });
        });
    }

    async getLastBlock(){
        return await this.query('SELECT * FROM `blocks` ORDER BY `block_id` DESC LIMIT 1');
    }

    async deleteBlocksStartingAt(start){
        return await this.query('DELETE FROM `blocks` WHERE `block_id` >= ?', [start]);
    }

    async insertBlock(blockId, blockHash, blockParentHash){
        let params = [blockId, blockHash, blockParentHash];
        return await this.query('INSERT INTO `blocks` (`block_id`, `block_hash`, `block_parent_hash`) VALUES (?,?,?)', params);
    }

    async insertContract(values){
        let params = [
            values.blockId,
            values.contractType,
            values.contractDesc,
            values.ownerAddress,
            (typeof values.toAddress !== 'undefined') ? values.toAddress : null,
            (typeof values.assetName !== 'undefined') ? values.assetName : null,
            (typeof values.amount !== 'undefined') ? values.amount: null,
            (typeof values.frozenBalance !== 'undefined') ? values.frozenBalance: null,
            (typeof values.frozenDuration !== 'undefined') ? values.frozenDuration: null,
            (typeof values.accountName !== 'undefined') ? values.accountName: null
        ];
        let query = 'INSERT INTO `contracts` (`block_id`, `contract_type`, `contract_desc`, `owner_address`, `to_address`, `asset_name`, `amount`, `frozen_balance`, `frozen_duration`, `account_name`) VALUES (?,?,?,?,?,?,?,?,?,?)';

        return await this.query(query, params);
    }

    async insertAsset(ownerAddress, name, totalSupply, trxNum, num, startTime, endTime, decayRatio, voteScore, description, url){
        return new Promise((resolve, reject)=>{
            let params = [ownerAddress, name, totalSupply, trxNum, num, startTime, endTime, decayRatio, voteScore, description, url];
            let queryStr = "INSERT INTO `assets` (`owner_address`, `name`, `total_supply`, `trx_num`, `num`, `start_time`, `end_time`, `decay_ratio`, `vote_score`, `description`, `url`) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
            this.pool.query(queryStr, params, function (error, result) {
                if (error){
                    console.log(error);
                    throw "failed to insert asset";
                }else{
                    resolve(result.insertId);
                }
            });
        });
    }

}