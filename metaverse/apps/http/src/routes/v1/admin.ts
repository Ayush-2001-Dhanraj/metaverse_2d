import { Router } from "express";

export const adminRouter = Router()

adminRouter.post("/element", (req, res) => { res.json({ message: "element" }) })
adminRouter.put("/element/:elementId", (req, res) => { res.json({ message: "element" }) })
adminRouter.post("/avatar", (req, res) => { res.json({ message: "avatar" }) })
adminRouter.post("/map", (req, res) => { res.json({ message: "map" }) })