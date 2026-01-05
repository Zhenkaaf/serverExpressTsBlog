"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const checkAuth_1 = require("../utils/checkAuth");
const router = (0, express_1.Router)();
//http://localhost:5000/api/auth/register
router.post("/register", auth_1.register);
router.post("/login", auth_1.login);
router.get("/profile", checkAuth_1.checkAuth, auth_1.getProfile);
router.post("/reset-password", auth_1.resetPassword);
router.post("/verify-code", auth_1.verifyCode);
router.post("/create-new-password", auth_1.createNewPassword);
exports.default = router;
