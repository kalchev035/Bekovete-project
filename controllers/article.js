/**
 * Created by Mecho on 22.4.2017 г..
 */
const Article = require('mongoose').model('Article');

module.exports = {
    createGet: (req, res) => {
        res.render('article/create');
    },

    createPost: (req, res) => {
        let articleArgs = req.body;

        let errorMsg = '';

        if(!req.isAuthenticated()){
            errorMsg = 'You should be logged in to make articles!';
        }
        else if (!articleArgs.title){
            errorMsg = 'Invalid title!';
        }
        else if (!articleArgs.content){
            errorMsg = 'Invalid content!';
        }

        if (errorMsg) {
            res.render('article/create', {error: errorMsg});
            return;
        }

        let image = req.files.image;

        if(image){
            let filename = image.name;

            image.mv(`./public/images/${filename}`, err =>{
                if(err){
                    console.log(err.message);
                }
            });
            articleArgs.imagePath = `/images/${image.name}`;
        }

        articleArgs.author = req.user.id;

        Article.create(articleArgs).then(article => {
            req.user.articles.push(article.id);
            req.user.save(err => {
                if (err) {
                    res.redirect('/', {error: err.message});
                }
                else {
                    res.redirect('/');
                }
            });
        });
    },

    details: (req, res) => {
        let id = req.params.id;

        Article.findById(id).populate('author').then(article => {
            if (!req.user) {
                res.render('article/details', {article: article, isUserAuthorized: false});
                return;
            }

            req.user.isInRole('Admin').then(isAdmin => {
                let isUserAuthorized = isAdmin || req.user.isAuthor(article);

                res.render('article/details', {article: article, isUserAuthorized: isUserAuthorized});
            });
        });
    },

    editGet: (req,res) => {
        if (req.user !== undefined) {
            let id = req.params.id;
            Article.findById(id).then(article => {
                req.user.isInRole('Admin').then(isAdmin => {
                    if (!isAdmin && !req.user.isAuthor(article)) {

                        res.redirect(`/`);
                        return;
                    }

                    res.render('article/edit', article);
                });
            });
        }
        else {
            res.render('user/login', {error: 'You should be logged in to edit articles!'});
        }
    },

    editPost: (req,res) => {
        let id = req.params.id;

        let articleArgs = req.body;

        let errorMsg = '';
        if (!articleArgs.title) {
            errorMsg = 'Article title cannot be empty!';
        }
        else if (!articleArgs.content) {
            errorMsg = 'Article content cannot be empty!';
        }

        if (errorMsg) {
            res.render('article/edit', {error: errorMsg});
        }
        else {
            Article.update({_id: id}, {$set: {title: articleArgs.title, content: articleArgs.content}})
                .then(updateStatus => {
                    res.redirect(`/article/details/${id}`);
                });
        }
    },

    deleteGet: (req,res) => {
        let id = req.params.id;

        if (!req.isAuthenticated()) {
            let returnUrl = `/article/delete/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        Article.findById(id).then(article => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(article)) {
                    res.redirect('/');
                    return;
                }

                res.render('article/delete', article);
            });
        });
    },

    deletePost: (req,res) => {
        let id = req.params.id;
        Article.findOneAndRemove({_id: id}).populate('author').then(article => {
            let author = article.author;

            let index = author.articles.indexOf(article.id);

            if (index < 0) {
                let errorMsg = 'Article was not found for that author!';
                res.render('article/delete', {error: errorMsg});
            }
            else {
                let count = 1;
                author.articles.splice(index, count);
                author.save().then((user) => {
                    res.redirect('/');
                })
            }
        });
    }
};