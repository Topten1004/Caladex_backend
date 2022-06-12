const StakeLog = require('../models/stakeLogModel');
const Web3 = require('web3');
const ethers = require('ethers');
const CALADEX_ABI = require('./caladexABI.json');
const Balance = require('../models/balanceModel');
const Stake = require('../models/stakeModel');


exports.getFinishStakeLog = async () => {
    let curDate = new Date().toLocaleDateString('en-GB', {
        timeZone: 'America/Aruba'
    });
    const time = curDate.split('/');
    const date = new Date(time[2],time[1], time[0]);
    // const doc = await StakeLog.find().populate('stake_id');
    StakeLog.where('is_finished').equals(false).where('finish_date').lte(date).populate('stake_id')
        .exec(async function (err, result) {
        if (err){
            console.log(err)
        }else{
            console.log("Result :", result);
            
            const privateKey = process.env.PRIVATE_KEY;
            const web3 = new Web3(new Web3.providers.HttpProvider( process.env.PROVIDER ));
            const etherReceiver = new web3.eth.Contract(CALADEX_ABI, process.env.CALADEX_ADDR);

            for(let i = 0; i < result.length; ++ i) {
                let tx = {};
                let stake = await Stake.findOne({_id: result[i].stake_id}).populate('token_id');
                if(stake.token_id.symbol == 'ETH') {
                    tx = {
                        to :  process.env.CALADEX_ADDR,
                        gasLimit: 3141592,
                        gasUsed: 21662,
                        data : etherReceiver.methods.unStake(result[i].address, ethers.utils.formatBytes32String('ETH'), result[i].stakelog_id, result[i].duration).encodeABI()
                    }
                }
                else {
                    tx = {
                        to :  process.env.CALADEX_ADDR,
                        gasLimit: 3141592,
                        gasUsed: 21662,
                        data : etherReceiver.methods.unStake(result[i].address, ethers.utils.formatBytes32String(stake.token_id._id.toString()), result[i].stakelog_id, result[i].duration).encodeABI()
                    }
                }

                await web3.eth.accounts.signTransaction(tx, privateKey).then(async signed => {
                    await web3.eth.sendSignedTransaction(signed.rawTransaction)
                        .then(async (receipt) => {
                        console.log('Receipt: ' + receipt);

                        const stakelog = StakeLog.find({stakelog_id:result[i].stakelog_id});
                        stakelog.is_finished = true;
                        stakelog.save();

                        let stake = await Stake.findOne({_id: stakelog.stake_id}).populate('token_id');
                        let balance = await Balance.findOne({address: address, token_id: stake.token_id._id });

                        await etherReceiver.methods.getBalance(address, ethers.utils.formatBytes32String(stake.token_id.symbol == "ETH"? "ETH": stake.token_id._id.toString())).call(function(error, result) {
                            // let rlt = result.toString();
                            console.log('Balance: '+ Web3.utils.fromWei(result.toString()) );
                            console.log(balance);
                            balance.caladex_balance = Web3.utils.fromWei(result.toString());
                            balance.save();
                        });
                    })
                    .catch((error) => {
                        console.log('Transaction error: '+error.message);
                    });
                });
            }

        }
    });
    
};