import { Router } from "express";
import { 
  registerWarga, 
  loginWarga, 
  loginWarung, 
  registerWarung,
  verifyWarung
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", registerWarga);
router.post("/login", loginWarga);
router.post("/warung/register", registerWarung);
router.post("/warung/login", loginWarung);
router.post("/warung/verify", verifyWarung); // Route verifikasi berkas

export default router;