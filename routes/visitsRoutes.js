import express from "express";
import { getMonthlyVisits } from "../controllers/visitController.js";

const router = express.Router();

router.get("/visits", getMonthlyVisits);

export default router;
