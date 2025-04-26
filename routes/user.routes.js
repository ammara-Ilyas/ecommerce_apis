import express from "express";
import { Router } from "express";
import { handleRegister, handleLogin } from "../controllers/user.controller.js";

const router = express.Router();
console.log("router");

router.get("/register", handleRegister);
router.get("/login", handleLogin);

export default router;
