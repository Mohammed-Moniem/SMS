const { authMessages } = require('../helpers/messages/messages');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

const { userDoesNotExist, userExist, mailNotSent } = authMessages;

// GET GET GET GET GET GET GET GET GET GET GET GET GET GET

//@Desc   Get Current logged in user
exports.getMyAccountService = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse(`${userDoesNotExist}`, 404));
  }
  return user;
});

// POST POST POST POST POST POST POST POST POST POST POST POST POST POST

// @desc      Register user
exports.registerService = asyncHandler(async (req, res, next) => {
  const { errors, isValid } = validateSingUpInput(req.body);
  // Check Validation
  if (!isValid) {
    return next(new ErrorResponse(`${JSON.stringify(errors)}`, 400));
  }
  const userCheck = await User.findOne({
    email: req.body.email.toLowerCase().trim().replace(/\s/g, ''),
  });

  if (userCheck) {
    return next(new ErrorResponse(`${userExist}`, 400));
  }

  // Send Email verification
  let otpCode = Math.random();
  otpCode = otpCode * 1000000;
  otpCode = parseInt(otpCode);

  //Create user
  const user = await User.create({
    ...req.body,
    email: req.body.email.toLowerCase().trim(),
    otp: { createdAt: new Date(), code: otpCode },
  });

  try {
    await sendVerification(req, otpCode);
  } catch (error) {
    console.log(error);
    return next(new ErrorResponse(`${mailNotSent}`, 500));
  }

  return user;
});
