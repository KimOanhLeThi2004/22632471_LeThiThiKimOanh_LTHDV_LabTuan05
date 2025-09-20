const User = require('../models/User');
if (!user) return res.render('auth/login', { error: 'Sai username hoặc password' });
const match = await user.comparePassword(password);
if (!match) return res.render('auth/login', { error: 'Sai username hoặc password' });
// set session
req.session.userId = user._id;
req.session.userRole = user.role;
if (remember) {
// extend cookie maxAge
req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
}
const redirectTo = req.session.returnTo || '/';
delete req.session.returnTo;
res.redirect(redirectTo);
} catch (err) {
console.error(err);
res.render('auth/login', { error: 'Có lỗi khi đăng nhập' });
}
}


exports.logout = (req, res) => {
req.session.destroy(err => {
res.clearCookie('connect.sid');
res.redirect('/auth/login');
});
}


exports.getForgot = (req, res) => res.render('auth/forgot');
exports.postForgot = async (req, res) => {
const { email } = req.body;
const user = await User.findOne({ email });
if (!user) return res.render('auth/forgot', { message: 'Nếu email tồn tại, bạn sẽ nhận đường link trong hộp thư' });
const token = crypto.randomBytes(20).toString('hex');
user.resetToken = token;
user.resetTokenExpires = Date.now() + 3600000; // 1 hour
await user.save();
const resetLink = `${process.env.BASE_URL}/auth/reset/${token}`;
// send email (here we just log, or use mailer to send real email)
mailer.sendMail({ to: user.email, subject: 'Password reset', text: `Reset link: ${resetLink}` });
res.render('auth/forgot', { message: 'Nếu email tồn tại, bạn sẽ nhận đường link trong hộp thư' });
}


exports.getReset = async (req, res) => {
const { token } = req.params;
const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
if (!user) return res.render('auth/reset', { error: 'Token không hợp lệ hoặc đã hết hạn' });
res.render('auth/reset', { token });
}


exports.postReset = async (req, res) => {
const { token } = req.params;
const { password } = req.body;
const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
if (!user) return res.render('auth/reset', { error: 'Token không hợp lệ hoặc đã hết hạn' });
user.password = password;
user.resetToken = undefined;
user.resetTokenExpires = undefined;
await user.save();
res.render('auth/reset', { message: 'Đổi mật khẩu thành công. Bạn có thể đăng nhập.' });
}