const User = require('../models/User');
const crypto = require('crypto');
const mailer = require('../config/mailer'); // nodemailer đã cấu hình trong /config/mailer.js

// -------------------- UTILS --------------------

// Hàm xóa user test cũ (ví dụ username chứa "test")
exports.deleteTestUsers = async () => {
  try {
    const result = await User.deleteMany({ username: /test/i });
    console.log('Deleted test users:', result.deletedCount);
  } catch (err) {
    console.error('Error deleting test users:', err);
  }
};

// -------------------- LOGIN --------------------

// GET login page
exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login', error: null });
};

// POST login
exports.postLogin = async (req, res) => {
  try {
    const usernameOrEmail = req.body.username.trim();
    const password = req.body.password;
    const remember = req.body.remember;

    console.log('Login attempt:', usernameOrEmail);

    // Tìm user theo username hoặc email (ignore case)
    const user = await User.findOne({
      $or: [
        { username: new RegExp(`^${usernameOrEmail}$`, 'i') },
        { email: new RegExp(`^${usernameOrEmail}$`, 'i') }
      ]
    });

    if (!user) {
      console.log('Login failed: username/email not found');
      return res.render('auth/login', { title: 'Login', error: 'Sai username hoặc password' });
    }

    // Debug: log user info (không log password thật ra production)
    console.log('User found:', { username: user.username, email: user.email, passwordHash: user.password });

    const match = await user.comparePassword(password);
    console.log('Password match:', match);

    if (!match) return res.render('auth/login', { title: 'Login', error: 'Sai username hoặc password' });

    // Set session
    req.session.userId = user._id;
    req.session.userRole = user.role;
    if (remember) req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 ngày

    const redirectTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectTo);
  } catch (err) {
    console.error(err);
    res.render('auth/login', { title: 'Login', error: 'Có lỗi khi đăng nhập' });
  }
};

// -------------------- REGISTER --------------------

// GET register page
exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register', error: null });
};

// POST register
exports.postRegister = async (req, res) => {
  try {
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password;

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.render('auth/register', { title: 'Register', error: 'Username hoặc email đã tồn tại' });

    const user = new User({ username, email, password });
    await user.save();
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    res.render('auth/register', { title: 'Register', error: 'Có lỗi xảy ra. Vui lòng thử lại.' });
  }
};

// -------------------- LOGOUT --------------------

exports.logout = (req, res) => {
  req.session.destroy(err => {
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
};

// -------------------- FORGOT PASSWORD --------------------

// GET forgot password page
exports.getForgot = (req, res) => {
  res.render('auth/forgot', { title: 'Forgot Password', message: null, error: null });
};

// POST forgot password
exports.postForgot = async (req, res) => {
  try {
    const email = req.body.email.trim();
    const user = await User.findOne({ email });
    const message = 'Nếu email tồn tại, bạn sẽ nhận đường link trong hộp thư';

    if (!user) return res.render('auth/forgot', { title: 'Forgot Password', message, error: null });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 3600000; // 1 giờ
    await user.save();

    const resetLink = `${process.env.BASE_URL || 'http://localhost:3000'}/auth/reset/${token}`;

    await mailer({
      to: user.email,
      subject: 'Reset your password',
      text: `Bạn nhận được email này vì yêu cầu reset password. Nhấn vào link sau để reset: ${resetLink}`,
      html: `
        <p>Bạn nhận được email này vì yêu cầu reset password.</p>
        <p>Nhấn vào link dưới đây để đặt lại mật khẩu:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Link có hiệu lực 1 giờ.</p>
      `
    });

    console.log(`Password reset token created for: ${user.username}  Token: ${token}`);
    console.log(`Email sent to ${user.email}`);

    res.render('auth/forgot', { title: 'Forgot Password', message, error: null });
  } catch (err) {
    console.error(err);
    res.render('auth/forgot', { title: 'Forgot Password', message: null, error: 'Có lỗi xảy ra. Vui lòng thử lại.' });
  }
};

// -------------------- RESET PASSWORD --------------------

// GET reset password page
exports.getReset = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });

    if (!user) return res.render('auth/reset', { title: 'Reset Password', error: 'Token không hợp lệ hoặc đã hết hạn', token: null, message: null });

    res.render('auth/reset', { title: 'Reset Password', token, error: null, message: null });
  } catch (err) {
    console.error(err);
    res.render('auth/reset', { title: 'Reset Password', token: null, error: 'Có lỗi xảy ra. Vui lòng thử lại.', message: null });
  }
};

// POST reset password
exports.postReset = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
    if (!user) return res.render('auth/reset', { title: 'Reset Password', token: null, error: 'Token không hợp lệ hoặc đã hết hạn', message: null });

    user.password = password; // sẽ được hash tự động bởi pre-save
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    console.log(`Password reset successful for user: ${user.username}  New password hash: ${user.password}`);

    res.render('auth/reset', { title: 'Reset Password', token: null, error: null, message: 'Đổi mật khẩu thành công. Bạn có thể đăng nhập.' });
  } catch (err) {
    console.error(err);
    res.render('auth/reset', { title: 'Reset Password', token: null, error: 'Có lỗi xảy ra. Vui lòng thử lại.', message: null });
  }
};
