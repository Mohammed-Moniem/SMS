const { authMessages } = require("../helpers/messages/messages");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

const { userDoesNotExist } = authMessages;

// GET GET GET GET GET GET GET GET GET GET GET GET GET GET


//@Desc   Get Current logged in user
//@route  POST /api/v1/auth/my-account
//@access Public
exports.getMyAccountService = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new ErrorResponse(`${userDoesNotExist}`, 404));
    }
    res.status(200).json({ success: true, data: user });
});