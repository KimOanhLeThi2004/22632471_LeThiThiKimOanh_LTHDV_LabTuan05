const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  phone: { type: String },
  password: { type: String, required: true },
  resetToken: { type: String },
  resetTokenExpires: { type: Date },
  role: { type: String, default: 'user' } // 'admin' can manage CRUD
}, { timestamps: true });

// Hash password trước khi save
userSchema.pre('save', async function(next){
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch(err) {
    next(err);
  }
});

// So sánh password
userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
}

module.exports = mongoose.model('User', userSchema);
