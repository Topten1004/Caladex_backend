const Stake = require('../models/stakeModel');
const Token = require('../models/tokenModel');
const base = require('./baseController');
const APIFeatures = require('../utils/apiFeatures');
const { get } = require('mongoose');

exports.getAllStakes  = async(req, res, next) => {
    try {
        
        let doc = [];
        await Stake.find({}).populate({
            path: 'token_id',
            match: {
                $or: [
                    { name: RegExp(req.body.search_str, 'i') },
                    { symbol: RegExp(req.body.search_str, 'i') }
                ]
            }
        }).exec(function(err, stakes) {
            stakes.filter(function(stake) {
                // doc = stake;
                if(stake.token_id)
                    doc.push(stake);
            });
            // console.log(doc);
            res.status(200).json({
                status: 'success',
                results: doc.length,
                data: {
                    data: doc
                }
            });
        });
        
    } catch (error) {
        next(error);
    }

};
exports.getStake = base.getOne(Stake);

// Don't update password on this 
exports.updateStake = async(req, res, next) => {
    try {
        const doc = await Stake.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!doc) {
            return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
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
exports.deleteStake = base.deleteOne(Stake);
exports.addStake = async(req, res, next) => {
    try {
        const doc = await Stake.create(req.body);

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



exports.search = async(req, res, next) => {
    try {
        // const token = await Token.find().where('symbol').regex(req.body.search_str);
        let doc = [];
        await Stake.find({}).populate({
            path: 'token_id',
            match: {
                $or: [
                    { name: RegExp(req.body.search_str, 'i') },
                    { symbol: RegExp(req.body.search_str, 'i') }
                ]
            }
        }).exec(function(err, stakes) {
            stakes.filter(function(stake) {
                // doc = stake;
                if(stake.token_id)
                    doc.push(stake);
            });
            // console.log(doc);
            res.status(200).json({
                status: 'success',
                results: doc.length,
                data: {
                    data: doc
                }
            });
        });
    } catch(err ) {
        next(err);
    }
}

exports.getTime = async(req, res, next) => {
    try {
        let curDate = new Date().toLocaleString('en-GB', {
            timeZone: 'America/Aruba'
        });
        // const time = curDate.split(',')[0].split('/');
        // const date = new Date(time[2],time[1] - 1, time[0]);
        // console.log(curDate);
        res.status(200).json({
            status: 'success',
            current_time: curDate,
        });
    } catch(err ) {
        next(err);
    }
}
