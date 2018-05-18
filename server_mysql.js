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

    async insertTransferContract(blockId, contractType, contractDesc, ownerAddress, toAddress, amount){
        let params = [blockId, contractType, contractDesc, ownerAddress, toAddress, amount];
        return await this.query('INSERT INTO `contracts` (`block_id`, `contract_type`, `contract_desc`, `owner_address`, `to_address`, `amount`) VALUES (?,?,?,?,?,?)', params);
    }

    async insertFrozenContract(blockId, contractType, contractDesc, ownerAddress, frozenBalance, frozenDuration){
        let params = [blockId, contractType, contractDesc, ownerAddress, frozenBalance, frozenDuration];
        return await this.query('INSERT INTO `contracts` (`block_id`, `contract_type`, `contract_desc`, `owner_address`, `frozen_balance`, `frozen_duration`) VALUES (?,?,?,?,?,?)', params);
    }

    async insertAssetIssueContract(blockId, contractType, contractDesc, ownerAddress, assetName){
        let params = [blockId, contractType, contractDesc, ownerAddress, assetName];
        return await this.query('INSERT INTO `contracts` (`block_id`, `contract_type`, `contract_desc`, `owner_address`, `asset_name`) VALUES (?,?,?,?,?)', params);
    }

    async insertVoteWitnessContract(blockId, contractType, contractDesc, ownerAddress){
        let params = [blockId, contractType, contractDesc, ownerAddress];
        return await this.query('INSERT INTO `contracts` (`block_id`, `contract_type`, `contract_desc`, `owner_address`) VALUES (?,?,?,?)', params);
    }

    async insertWitnessCreateContract(blockId, contractType, contractDesc, ownerAddress){
        let params = [blockId, contractType, contractDesc, ownerAddress];
        return await this.query('INSERT INTO `contracts` (`block_id`, `contract_type`, `contract_desc`, `owner_address`) VALUES (?,?,?,?)', params);
    }

    async insertAccountUpdateContract(blockId, contractType, contractDesc, ownerAddress, account_name){
        let params = [blockId, contractType, contractDesc, ownerAddress, account_name];
        return await this.query('INSERT INTO `contracts` (`block_id`, `contract_type`, `contract_desc`, `owner_address`, `account_name`) VALUES (?,?,?,?,?)', params);
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

    async insertParticipateAssetIssueContract(blockId, contractType, contractDesc, ownerAddress, toAddress, assetName, amount){
        let params = [blockId, contractType, contractDesc, ownerAddress, toAddress, assetName, amount];
        return await this.query('INSERT INTO `contracts` (`block_id`, `contract_type`, `contract_desc`, `owner_address`, `to_address`, `asset_name`, `amount`) VALUES (?,?,?,?,?,?,?)', params);
    }

}