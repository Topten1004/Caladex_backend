const Trade = require('../models/tradeModel');
const base = require('./baseController');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllTrades = async(req, res, next) => {
    try {
        const doc = await Trade.find(req.body).sort({time: 1});
        
        console.log('get');
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc
            }
        });
        
    } catch (error) {
        next(error);
    }

};
exports.getTrade = base.getOne(Trade);

// Don't update password on this 
exports.updateTrade = base.updateOne(Trade);
exports.deleteTrade = base.deleteOne(Trade);
exports.addTrade = base.createOne(Trade);

exports.getBuyTrades = async(req, res, next) => {
    try {
        const doc = await Trade.find({type: "buy"}).sort({time: 1});
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc
            }
        });
        
    } catch (error) {
        next(error);
    }
};

exports.getSellTrades = async(req, res, next) => {
    try {
        const doc = await Trade.find({type: "sell"}).sort({time: 1});
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc
            }
        });
        
    } catch (error) {
        next(error);
    }
};
