const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
    trader: {
        type: String,
        default: ""
    },
    time: {
        type: Date,
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

});

const Trade = mongoose.model("Trade", tradeSchema);
module.exports = Trade;