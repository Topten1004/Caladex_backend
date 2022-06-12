const mongoose = require("mongoose");

const stakeSchema = new mongoose.Schema({
    token_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Token'
    },
    product: {
        type: String,
        default: ""
    },
    est_apy: {
        type: Number,
        default: 0
    },
    finish_date: {
        type: Date,
        default: ""
    },
    is_popular_coin: {
        type: Boolean,
        default: false
    },
    is_best_for_beginners: {
        type: Boolean,
        default: false
    },
    is_new_listing: {
        type: Boolean,
        default: false
    },
});

const Stake = mongoose.models.Stake || mongoose.model("Stake", stakeSchema);
module.exports = Stake;