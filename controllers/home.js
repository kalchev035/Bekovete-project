const mongoose = require('mongoose');
const Article = mongoose.model('Article');

module.exports = {
    index: (req, res) => {
        Article.find({}).limit(25).populate('author').then(articles => {
            for (let article = 0; article < articles.length; article++) {
                let trimmedString =  articles[article].content.substring(0,300);
                articles[article].content = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))
            }
            articles.reverse();
            res.render('home/index',{articles: articles});
        });
    }
};