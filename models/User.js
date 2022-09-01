const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const messages = require("../helpers/messages");

const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, `${messages.authMessages.emailAr}`],
    unique: true,
    match: [
      /^[\w\d-_.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/,
      `${messages.authMessages.emailAr}`,
    ],
  },
  password: {
    type: String,
    required: [true, `${messages.authMessages.passwordAr}`],
    minlength: 6,
    maxlength: 255,
    select: false,
  },
  phoneNumber: {
    type: String,
    required: [true, `${messages.authMessages.phoneNumberAr}`],
    match: [
      /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
      `${messages.authMessages.phoneNumberAr}`,
    ],
  },
  avatar: {
    type: String,
  },
  role: {
    type: String,
    enum: ["admin", "teacher", 'student', 'parent', 'hr', 'accountant', 'payroll'],
    default: "parent",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    code: Number,
    createdAt: Date,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = User = mongoose.model("users", UserSchema);
