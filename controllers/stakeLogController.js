const StakeLog = require('../models/stakeLogModel');
const base = require('./baseController');
const APIFeatures = require('../utils/apiFeatures');
const Web3 = require('web3');
const ethers = require('ethers');
const CALADEX_ABI = require('../utils/caladexABI.json');
const Balance = require('../models/balanceModel');
const Stake = require('../models/stakeModel');
const Token = require('../models/tokenModel');

exports.getAllStakeLogs = base.getAll(StakeLog);

exports.getStakeLog = async(req, res, next) => {
    try {
        let doc = await StakeLog.find({address: req.params.address}).where('is_finished').equals(false).populate('stake_id');

        let curDate = new Date().toLocaleDateString('en-GB', {
            timeZone: 'America/Aruba'
        });
        const time = curDate.split('/');
        const date = new Date(time[2],time[1] -1, time[0]);

        for(let element of doc) {
            const finish_date= new Date(element.finish_date);
            element.duration = Math.floor((finish_date.getTime() - date.getTime()) / 1000 / 24 / 60 / 60);
        }
        res.status(200).json({
            status: 'success',
            data: {
                doc
            }
        });
    } catch (error) {
        next(error);
    }
};


exports.getFinishStakeLog = async(req, res, next) => {
    try {
        let curDate = new Date().toLocaleDateString('en-GB', {
            timeZone: 'America/Aruba'
        });
        const time = curDate.split('/');
        const date = new Date(time[2],time[1], time[0]);
        // const doc = await StakeLog.find().populate('stake_id');
        StakeLog.where('finish_date').gte(date).populate('stake_id')
            .exec(function (err, result) {
            if (err){
                console.log(err)
            }else{
                console.log("Result :", result);
                const doc = result;
                
                res.status(200).json({
                    status: 'success',
                    data: {
                        doc
                    }
                });
            }
        });
        
    } catch (error) {
        next(error);
    }
};


exports.addStakeLog = async(req, res, next) => {
    try {
        let {address, duration, amount, stake_id} = req.body;

        console.log('add stake');

        // const date = new Date(begin_date.getTime()  + duration );
        let curDate = new Date().toLocaleDateString('en-GB', {
            timeZone: 'America/Aruba'
        });
        const time = curDate.split(',')[0].split('/');
        const date = new Date(time[2],time[1] - 1, time[0]);
        let finish_date = new Date(date);
        finish_date.setDate(finish_date.getDate() + duration);

        req.body.begin_date = date;
        req.body.finish_date = finish_date;

        let stake = await Stake.findOne({_id: stake_id}).populate('token_id');
        let balance = await Balance.findOne({address: address, token_id: stake.token_id._id });
        
        const privateKey = process.env.PRIVATE_KEY;
        const web3 = new Web3(new Web3.providers.HttpProvider( process.env.PROVIDER ));
        const etherReceiver = new web3.eth.Contract(CALADEX_ABI, process.env.CALADEX_ADDR);

        let tx = {};

        if(stake.token_id.symbol == "ETH") {
            tx = {
                to :  process.env.CALADEX_ADDR,
                gasLimit: 3141592,
                gasUsed: 21662,
                data : etherReceiver.methods.addStake(address, "0xD76b5c2A23ef78368d8E34288B5b65D616B746aE", ethers.utils.formatBytes32String("ETH"), ethers.utils.parseEther(amount).toString(), curDate, duration, stake.est_apy * 100).encodeABI()
            }
        } else {
            tx = {
                to :  process.env.CALADEX_ADDR,
                gasLimit: 3141592,
                gasUsed: 21662,
                data : etherReceiver.methods.addStake(address, stake.token_id.address, ethers.utils.formatBytes32String(stake.token_id._id.toString()), ethers.utils.parseUnits(amount).toString(), curDate, duration, stake.est_apy * 100).encodeABI()
            }
        }
        console.log('staking...');
        await web3.eth.accounts.signTransaction(tx, privateKey).then(async signed => {
            await web3.eth.sendSignedTransaction(signed.rawTransaction)
                .then(async (receipt) => {
                console.log('Receipt: ' + receipt);
                console.log('Log ID: ' + parseInt(receipt.logs[0].data, 16));

                let stakelog = await StakeLog.create(req.body);
                stakelog.stakelog_id = parseInt(receipt.logs[0].data, 16);
                stakelog.save();

                console.log('getting balance...');
                await etherReceiver.methods.getBalance(address,ethers.utils.formatBytes32String(stake.token_id.symbol == "ETH"? "ETH": stake.token_id._id.toString())).call(function(error, result) {
                    // let rlt = result.toString();
                    if(error) {
                        res.status(201).json({
                            status: 'failed',
                        });
                    }
                    else {
                        console.log('Balance: '+ Web3.utils.fromWei(result.toString()) );
                        console.log(balance);
                        if(balance) {
                            balance.caladex_balance = Web3.utils.fromWei(result.toString());
                            balance.save();
                            res.status(200).json({
                                status: 'success',
                                data: {
                                    stakelog
                                }
                            });
                        }
                    }
                });
            }).catch((error) => {
                console.log('Transaction error: '+error.message);
                res.status(201).json({
                    status: 'failed',
                });
            });
        });

        console.log(balance);
        
    } catch (error) {
        next(error);
    }
};

exports.unStake = async(req, res, next) => {
    try {
        const {address, stakelog_id} = req.body;

        let stakelog = await StakeLog.findOne({ stakelog_id : stakelog_id, is_finished : false });

        if(!stakelog) {
            res.status(201).json({
                status: 'failed',
                message: 'stake log not found'
            });
            return;
        }
        
        let stake = await Stake.findOne({_id: stakelog.stake_id}).populate('token_id');
        let balance = await Balance.findOne({address: address, token_id: stake.token_id._id });

        let curDate = new Date().toLocaleDateString('en-GB', {
            timeZone: 'America/Aruba'
        });
        const time = curDate.split('/');
        const date = new Date(time[2],time[1] -1, time[0]);

        const privateKey = process.env.PRIVATE_KEY;
        const web3 = new Web3(new Web3.providers.HttpProvider( process.env.PROVIDER ));
        const etherReceiver = new web3.eth.Contract(CALADEX_ABI, process.env.CALADEX_ADDR);

        let tx = {};

        if(stake.token_id.symbol == 'ETH') {
            tx = {
                to :  process.env.CALADEX_ADDR,
                gasLimit: 3141592,
                gasUsed: 21662,
                data : etherReceiver.methods.unStake(address, ethers.utils.formatBytes32String('ETH'), stakelog_id, Math.floor((date.getTime() - stakelog.begin_date.getTime()) / 1000 / 24 / 60 / 60)).encodeABI()
            }
    
        } else {
            tx = {
                to :  process.env.CALADEX_ADDR,
                gasLimit: 3141592,
                gasUsed: 21662,
                data : etherReceiver.methods.unStake(address, ethers.utils.formatBytes32String(stake.token_id._id.toString()), stakelog_id, Math.floor((date.getTime() - stakelog.begin_date.getTime()) / 1000 / 24 / 60 / 60)).encodeABI()
            }
        }
        

        console.log("unstaking...");
        await web3.eth.accounts.signTransaction(tx, privateKey).then(async signed => {
            await web3.eth.sendSignedTransaction(signed.rawTransaction)
                .then(async (receipt) => {
                console.log('Receipt: ' + receipt);

                stakelog.is_finished = true;
                stakelog.save();
                
                console.log("getting balance...");
                await etherReceiver.methods.getBalance(address, ethers.utils.formatBytes32String(stake.token_id.symbol == "ETH"? "ETH": stake.token_id._id.toString())).call(function(error, result) {
                    // let rlt = result.toString();
                    if(error) {
                        res.status(201).json({
                            status: 'failed',
                        });
                    }
                    else {
                        console.log('Balance: '+ Web3.utils.fromWei(result.toString()) );
                        console.log(balance);
                        if(balance) {
                            balance.caladex_balance = Web3.utils.fromWei(result.toString());
                            balance.save();
                        }
                        res.status(200).json({
                            status: 'success',
                        });
                    }
                });
            })
            .catch((error) => {
                console.log('Transaction error: '+error.message);
                res.status(201).json({
                    status: 'failed',
                });
            });
        });

        console.log(balance);

    } catch (error) {
        next(error);
    }
};