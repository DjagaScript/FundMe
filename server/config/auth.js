module.exports = {
    isAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/auth/login');
        }
    },
    isInRole: (role) =>
        (req, res, next) => {
            if (req.user && req.user.roles.indexOf(role) > -1) {
                next();
            } else {
                res.status(401).json({
                    success: false,
                    message: 'Not authorized!'
                });
            }
        }

};