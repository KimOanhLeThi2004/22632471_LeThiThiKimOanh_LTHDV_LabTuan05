module.exports = {
ensureAuthenticated: function(req, res, next) {
if (req.session && req.session.userId) return next();
req.session.returnTo = req.originalUrl;
return res.redirect('/auth/login');
},
ensureAdmin: function(req, res, next) {
if (req.session && req.session.userRole === 'admin') return next();
return res.status(403).send('Forbidden');
}
};