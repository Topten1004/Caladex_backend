const News = require('../models/newsModel');
const base = require('./baseController');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllNews = base.getAll(News);
exports.getNews = base.getOne(News);

// Don't update password on this 
exports.updateNews = base.updateOne(News);
exports.deleteNews = base.deleteOne(News);
exports.addNews = base.createOne(News);

exports.blockNews = async(req, res, next) => {
    try {
        const news = await News.findOne({ _id: req.body.id });
        news.status_id = 1 - news.status_id;
        news.save();

        res.status(200).json({
            status: "success",
            active: news.status_id,
        });

    } catch (err) {
        next(err);
    }
}