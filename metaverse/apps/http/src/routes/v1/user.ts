import { Router } from "express";

export const userRouter = Router()

userRouter.post("/metadata", (req, res) => { res.json({ message: "metadata" }) })
userRouter.get("/metadata/bulk", (req, res) => { res.json({ message: "metadata bulk" }) })