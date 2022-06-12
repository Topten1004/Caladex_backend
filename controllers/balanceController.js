const Balance = require('../models/balanceModel');
const base = require('./baseController');
const APIFeatures = require('../utils/apiFeatures');
const Web3 = require('web3');
const ethers = require('ethers');
const CALADEX_ABI = require('../utils/caladexABI.json');

exports.getAllBalances = base.getAll(Balance);

exports.getBalance = async(req, res, next) => {
    try {
        const doc = await Balance.find({address: req.params.address}).populate('token_id');

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

exports.setBalance = async(req, res, next) => {
    try {
        const {address, token_id, amount, is_deposit} = req.body;

        console.log(address);
        console.log(token_id);
        console.log(amount);
        console.log(is_deposit);
        let balance = await Balance.findOne({ address, token_id });

        if(!balance) {
            balance = await Balance.create(req.body);
        }

        balance = await Balance.findOne({ address, token_id }).populate('token_id');


        const privateKey = process.env.PRIVATE_KEY;
        const web3 = new Web3(new Web3.providers.HttpProvider( process.env.PROVIDER ));
        const etherReceiver = new web3.eth.Contract(CALADEX_ABI, process.env.CALADEX_ADDR);

        if(!is_deposit) {

            console.log("withdraw");
            // const tx = {
            //     to :  process.env.CALADEX_ADDR,
            //     gasLimit: 3141592,
            //     gasUsed: 21662,
            //     data : etherReceiver.methods.withdraw(address, balance.token_id.address, ethers.utils.parseUnits(amount).toString()).encodeABI()
            // }

            // await web3.eth.accounts.signTransaction(tx, privateKey).then(async signed => {
            //     await web3.eth.sendSignedTransaction(signed.rawTransaction)
            //         .then((receipt) => {
            //         console.log('Receipt: ' + receipt);
            //     })
            //     .catch((error) => {
            //         console.log('Transaction error: '+error.message);

            //         res.status(201).json({
            //             status: 'failed',
            //         });
            //     });
            // });
            // console.log(ethers.utils.parseUnits(amount).toString())

            await etherReceiver.methods.getBalance(address,ethers.utils.formatBytes32String(balance.token_id.symbol == "ETH" ? "ETH": balance.token_id._id.toString())).call(function(error, result) {
                // let rlt = result.toString();
                if(error) {
                    res.status(201).json({
                        status: 'failed',
                    });
                    return;
                } else {
                    console.log('Balance: '+ Web3.utils.fromWei(result.toString()) );
                    balance.caladex_balance = Web3.utils.fromWei(result.toString());
                    balance.save();
                    // 
                    res.status(200).json({
                        status: 'success',
                        data: {
                            balance
                        }
                    });
                }
            });
        } else {
            console.log('get balance');
            
            console.log(balance.token_id._id) ;

            console.log(balance.token_id.symbol == "ETH" ? ethers.utils.formatBytes32String("ETH"): ethers.utils.formatBytes32String(balance.token_id._id.toString()));
            
            await etherReceiver.methods.getBalance(address,ethers.utils.formatBytes32String((balance.token_id.symbol == "ETH" ? "ETH": balance.token_id._id.toString()))).call(function(error, result) {
                // let rlt = result.toString();
                if(error) {
                    res.status(201).json({
                        status: 'failed',
                    });
                    return ;
                }else {
                    console.log('Balance: '+ Web3.utils.fromWei(result.toString()) );
                    balance.caladex_balance = Web3.utils.fromWei(result.toString());
                    balance.save();
                    // 
                    res.status(200).json({
                        status: 'success',
                        data: {
                            balance
                        }
                    });
                }
            });

        }

        // console.log(balance);
        

    } catch (error) {
        console.log(error);
        next(error);
    }
};