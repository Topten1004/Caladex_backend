const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderer: {
        type: String,
        default: ""
    },
    token_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Token'
    },
    pair_token: {
        type: String,
        enum: ['USDT', 'ETH'],
        default: "USDT"
    },
    price: {
        type: String,
        default: ""
    },
    amount: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: ["buy", "sell"],
        default: "sell"
    },
    is_traded: {
        type: Boolean,
        default: false
    }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;