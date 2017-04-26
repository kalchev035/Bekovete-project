/**
 * Created by Kamen on 22.4.2017 г..
 */
const mongoose = require('mongoose');

let dateFormat = require('dateformat');

let articleSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    date: {type: String, default: dateFormat(Date.now(), "mmmm dS, yyyy, h:MM:ss TT")},
    editDate: {type: String},
    imagePath: {type: String}
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;