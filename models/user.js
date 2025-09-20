const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
username: { type: String, required: true, unique: true },
email: { type: String, required: true, unique: true },
phone: { type: String },
password: { type: String, required: true },
resetToken: { type: String },
resetTokenExpires: { type: Date },
role: { type: String, default: 'user' } // 'admin' can manage CRUD
}, { timestamps: true });


userSchema.pre('save', async function(next){
if (!this.isModified('password')) return next();
const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password, salt);
next();
});


userSchema.methods.comparePassword = function(candidate) {
return bcrypt.compare(candidate, this.password);
}


module.exports = mongoose.model('User', userSchema);