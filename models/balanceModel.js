const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema({
    address: {
        type: String,
        default: ""
    },
    token_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Token'
    },
    caladex_balance: {
        type: Number,
        default: 0
    },
    order_balance: {
        type: Number,
        default: 0
    }
});

const Balance = mongoose.model("Balance", balanceSchema);
module.exports = Balance;