const express = require("express");
const {
    register,
    login,
    getMyAccount,
    getUserById,
    updateDetails,
    updatePassword,
    uploadProfilePicture,
} = require("../controllers/auth");

const router = express.Router();
//Import Middleware
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/my-account", protect, getMyAccount);
router.get("/profile/:id", protect, getUserById);
router.put("/update-details", protect, updateDetails);
router.put("/update-password", protect, updatePassword);
router.post("/upload-profile-picture", protect, uploadProfilePicture);

module.exports = router;
