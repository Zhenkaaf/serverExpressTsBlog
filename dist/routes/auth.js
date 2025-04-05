"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const checkAuth_1 = require("../utils/checkAuth");
const router = (0, express_1.Router)();
//http://localhost:5000/api/auth/register
router.post("/register", auth_1.register);
router.post("/login", auth_1.login);
router.get("/getProfile", checkAuth_1.checkAuth /*  getProfile */);
exports.default = router;
