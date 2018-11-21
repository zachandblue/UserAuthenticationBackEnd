const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  //   _id: mongoose.Schema.Types.ObjectId,
  _id: { type: String, required: true },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: { type: String, required: true },
  passwordConfirm: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
