const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { authMessages } = require('../helpers/messages');

const uploadImage = require('../utils/uploadImage');
const getImageUrl = require('../utils/getImageUrl');
const compress = require('../utils/compress');
const createOTP = require('../utils/createOTP');
const sendVerification = require('../utils/sendVerificationEmail');

// Importing Validation middleware
const validateLoginInput = require('../validation/users/login');
const validateSingUpInput = require('../validation/users/register');
const validateUpdate = require('../validation/users/updateUser');

//Import Models
const User = require('../models/User');
const { getMyAccountService } = require('../services/auth');

// GET GET GET GET GET GET GET GET GET GET GET GET GET GET

//@Desc   Get Current logged in user
//@route  POST /api/v1/auth/my-account
//@access Public
exports.getMyAccount = asyncHandler(async (req, res, next) => {
  const user = await getMyAccountService(req, res, next);
  res.status(200).json({ success: true, data: user });
});

// POST POST POST POST POST POST POST POST POST POST POST POST POST POST

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const user = await registerService(req, res, next);
  sendTokenResponse(user, 200, res);
});

//@Desc   Login Users
//@route  GET /api/v1/auth/verify
//@access Public
exports.verify = asyncHandler(async (req, res, next) => {
  //Check for user
  const user = await User.findOne({
    email: req.body.email.toLowerCase().trim(),
  }).select('+password');
  if (!user) {
    return next(new ErrorResponse(`${authMessages.userDoNotExistAr}`, 404));
  }

  if (user.isVerified) {
    return next(new ErrorResponse(`${authMessages.verificationDoneAr}`, 400));
  }

  if (user.otp.code !== req.body.otp || !req.body.otp) {
    return next(new ErrorResponse(`${authMessages.wrongOtpAr}`, 400));
  }

  user.isVerified = true;
  user.otp = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//@Desc   Login Users
//@route  GET /api/v1/auth/login
//@access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { errors, isValid } = validateLoginInput(req.body);
  // Check Validation
  if (!isValid) {
    return next(new ErrorResponse(`${JSON.stringify(errors)}`, 400));
  }

  //Check for user
  const user = await User.findOne({
    email: req.body.email.toLowerCase().trim(),
  }).select('+password');
  if (!user) {
    return next(new ErrorResponse(`${authMessages.userDoNotExistAr}`, 404));
  }

  const isMatch = await user.matchPassword(req.body.password);
  if (!isMatch) {
    return next(new ErrorResponse(`${authMessages.passwordAr}`, 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Update password
// @route     POST /api/v1/auth/update-password
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new ErrorResponse(`${authMessages.loginAr}`, 400));
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorResponse(`${authMessages.confirmPasswordAr}`, 400));
  }
  // Check current password
  if (!(await user.matchPassword(req.body.newPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Upload user photo
// @route     POST /api/v1/auth/profile-photo-upload
// @access    Private
exports.uploadProfilePicture = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse(`${authMessages.loginAr}`, 404));
  }
  // upload user profile
  if (req.body.avatar) {
    try {
      const base64Check = req.body.avatar.substr(
        0,
        req.body.avatar.indexOf(',')
      );
      const imageExtension = req.body.avatar.substr(
        req.body.avatar.indexOf('/'),
        req.body.avatar.indexOf(';')
      );
      //Check File Type
      if (!base64Check.includes('data:image')) {
        return next(new ErrorResponse(`${authMessages.imageTypeAr}`, 404));
      }
      //compression
      const compressedBase64Avatar = await compress(
        req.body.avatar,
        imageExtension
      );
      await uploadImage(req.user.id, compressedBase64Avatar);
      const url = await getImageUrl(req.user.id);
      user.avatar = url;
      await user.save();
    } catch (error) {
      console.log(error);
      return next(new ErrorResponse(`${authMessages.avatarUploadAr}`, 500));
    }
  } else {
    return next(new ErrorResponse(`${authMessages.noImageAr}`, 400));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});
// PUT PUT PUT PUT PUT PUT PUT PUT PUT PUT PUT PUT PUT PUT

// @desc      Update user details
// @route     PUT /api/v1/auth
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const userCheck = await User.findById(req.user.id);
  if (!userCheck) {
    return next(new ErrorResponse(`${authMessages.loginAr}`, 400));
  }
  const { errors, isValid } = validateUpdate(req.body);
  // Check Validation
  if (!isValid) {
    return next(new ErrorResponse(`${JSON.stringify(errors)}`, 400));
  }

  const fieldsToUpdate = {
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS HELPERS

//Get token from model also create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create Token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user,
  });
};
