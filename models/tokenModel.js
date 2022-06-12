const mongoose = require("mongoose");
//var uniqueValidator = require('mongoose-unique-validator');

const tokenSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        default: null,
    },
    symbol: {
        type: String,
        unique: true,
        default: null,
    },
    decimal: {
        type: Number,
        default: 0,
    },
    pair_type: {
        type: String,
        enum: ["USDT", "ETH", "USDT,ETH"],
        default: "USDT",
    },
    address: {
        type: String,
        default: "",
    },
    website_url: {
        type: String,
        default: "",
    },
    logo_url: {
        type: String,
        default: ""
    },
    issuer_name: {
        type: String,
        default: ""
    },
    email_address: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        default: "applying",
    },
    short_version_pdf_url: {
        type: String,
        default: ""
    },
    long_version_pdf_url: {
        type: String,
        default: ""
    },
});

// tokenSchema.plugin(uniqueValidator);

const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;