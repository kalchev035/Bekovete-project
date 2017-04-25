const mongoose = require('mongoose');
const Role = mongoose.model('Role');
const encryption = require('./../utilities/encryption');

let userSchema = mongoose.Schema(
    {
        email: {type: String, required: true, unique: true},
        passwordHash: {type: String, required: true},
        fullName: {type: String, required: true},
        articles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Article'}],
        roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}],
        salt: {type: String, required: true},
        imagePath: {type: String}
    }
);

userSchema.method ({
   authenticate: function (password) {
       let inputPasswordHash = encryption.hashPassword(password, this.salt);
       let isSamePasswordHash = inputPasswordHash === this.passwordHash;

       return isSamePasswordHash;
   }
});

userSchema.method ({
    isAuthor: function (article) {
        if (!article) {
            return false;
        }

        let isAuthor = article.author.equals(this.id);

        return isAuthor;
    },

    isInRole: function (roleName) {
        return Role.findOne({name: roleName}).then(role => {
            if (!role) {
                return false;
            }

            let isInRole = this.roles.indexOf(role.id) !== -1;
            return isInRole;
        });
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.seedAdmin = () => {
    let email = 'admin@bekovete.bg';
    User.findOne({email: email}).then(admin => {
        if (!admin) {
            Role.findOne({name: 'Admin'}).then(role => {
                if (!role) {
                    return;
                }
                let salt = encryption.generateSalt();
                let passwordHash = encryption.hashPassword('admin123', salt);

                let roles = [];
                    roles.push(role.id);

                let user = {
                    email: email,
                    passwordHash: passwordHash,
                    fullName: 'Admin',
                    articles: [],
                    salt: salt,
                    roles: roles
                };

                User.create(user).then(user => {
                        role.users.push(user.id);
                    role.save(err => {
                        if (err) {
                            console.log(err.message);
                        }
                        else {
                            console.log('Admin ready!');
                        }
                    });
                });
            });
        }
    });
};