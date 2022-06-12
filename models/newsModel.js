const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        default: ""
    },
    content: {
        type: String,
        default: ""
    },
    status_id: {
        type: String,
        default: "1"
    },
    applies_to_date: {
        type: Date,
        default: "",
    },
});

const News = mongoose.model("News", newsSchema);
module.exports = News;