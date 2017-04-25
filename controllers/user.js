const User = require('mongoose').model('User');
const Role = require('mongoose').model('Role');
const encryption = require('./../utilities/encryption');

module.exports = {
    registerGet: (req, res) => {
        res.render('user/register');
    },

    detailsGet: (req, res) => {
        let id = req.params.id;

        User.findById(id).then(allArticles => {
            articleColletion = allArticles.articles;

            function countProperties(articleColletion) {
                var count = 0;

                for(let i = 0; i < articleColletion.length; i++) {
                    ++count;
                }

                return count;
            }

            res.render('user/details', {count: countProperties(articleColletion)})


        })
    },

    registerPost:(req, res) => {
        let registerArgs = req.body;

        User.findOne({email: registerArgs.email}).then(user => {
            let errorMsg = '';
            if (user) {
                errorMsg = 'User with the same username exists!';
            } else if (registerArgs.password !== registerArgs.repeatedPassword) {
                errorMsg = 'Passwords do not match!'
            }

            if (errorMsg) {
                registerArgs.error = errorMsg;
                res.render('user/register', registerArgs)
            } else {
                let salt = encryption.generateSalt();
                let passwordHash = encryption.hashPassword(registerArgs.password, salt);

                let roles = [];
                Role.findOne({name: 'User'}).then(role => {
                    roles.push(role.id);

                    let image = req.files.image;

                    if(image){
                        let filename = image.name;

                        image.mv(`./public/images/${filename}`, err =>{
                            if(err){
                                console.log(err.message);
                            }
                        });
                        registerArgs.imagePath = `/images/${image.name}`;
                    }

                    let userObject = {
                        email: registerArgs.email,
                        passwordHash: passwordHash,
                        fullName: registerArgs.fullName,
                        salt: salt,
                        roles: roles,
                        imagePath: registerArgs.imagePath
                    };


                    User.create(userObject).then(user => {

                        role.users.push(user.id);
                        role.save(err => {
                            if (err) {
                                res.render('user/register', {error: err.message});
                            }
                            else {
                                req.logIn(user, (err) => {
                                    if (err) {
                                        registerArgs.error = err.message;
                                        res.render('user/register', registerArgs);
                                        return;
                                    }

                                    res.redirect('/')
                                })
                            }
                        });
                    })
                });
            }
        })
    },

    loginGet: (req, res) => {
        res.render('user/login');
    },

    loginPost: (req, res) => {
        let loginArgs = req.body;
        User.findOne({email: loginArgs.email}).then(user => {
            if (!user ||!user.authenticate(loginArgs.password)) {
                let errorMsg = 'Either username or password is invalid!';
                loginArgs.error = errorMsg;
                res.render('user/login', loginArgs);
                return;
            }

            req.logIn(user, (err) => {
                if (err) {
                    console.log(err);
                    res.redirect('/user/login', {error: err.message});
                    return;
                }

                let returnUrl = '/';
                if(req.session.returnUrl) {
                    returnUrl = req.session.returnUrl;
                    delete req.session.returnUrl;
                }

                res.redirect(returnUrl);
            })
        })
    },

    logout: (req, res) => {
        req.logOut();
        res.redirect('/');
    }
};
