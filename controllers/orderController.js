const Order = require('../models/orderModel');
const base = require('./baseController');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllOrders = base.getAll(Order);
exports.getOrder = base.getOne(Order);

exports.getOrders = async(req, res, next) => {
    try {
        const doc = await Order.find({is_traded: false});
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

exports.getBuyOrders = async(req, res, next) => {
    try {
        const doc = await Order.find({type: "buy", is_traded: false});
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

exports.getAllBuyOrders = async(req, res, next) => {
    try {
        const doc = await Order.find({type: "buy"});
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

exports.getSellOrders = async(req, res, next) => {
    try {
        const doc = await Order.find({type: "sell", is_traded: false});
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

exports.getAllSellOrders = async(req, res, next) => {
    try {
        const doc = await Order.find({type: "sell"});
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
// Don't update password on this 
exports.updateOrder = base.updateOne(Order);
exports.deleteOrder = base.deleteOne(Order);
exports.addOrder = base.createOne(Order);