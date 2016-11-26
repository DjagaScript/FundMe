'use strict';

var Grid = require('gridfs');

module.exports = function(options) {
    return {
        getLogin(req, res) {
            //todo Is this code correct?
            res.status(200).render('user/login');
        },
        getRegister(req, res) {
            res.status(200).render('user/register');
        },
        getSettings(req, res) {
            res.status(200).render('user/settings', { avatar: req.user.avatar });
        },
        updateSettings(req, res) {

            if (req.file) {
                var gfs = Grid(options.database.connection.db, options.database.mongo);
                let data = options.data;

                gfs.writeFile({}, req.file.buffer, (err, file) => {
                    let avatar = file._id;
                    let user = req.user;

                    let infoToUpdate = {
                        avatar: avatar
                    };

                    data.updateUser(user._id, infoToUpdate)
                        .then(() => {
                            res.redirect('/user/settings');
                        });
                });
            }
        },
        getAvatar(req, res) {
            var gfs = Grid(options.database.connection.db, options.database.mongo);
            var id = req.params.id;
            gfs.readFile({ _id: id }, (err, data) => {
                res.write(data);
                res.end();
            });
        }
    };
};
