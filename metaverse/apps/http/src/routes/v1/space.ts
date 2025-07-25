import { Router } from "express";

export const spaceRouter = Router()

spaceRouter.post("/", (req, res) => { res.json({ message: "space" }) })
spaceRouter.delete("/:spaceId", (req, res) => { res.json({ message: "delete space" }) })
spaceRouter.get("/all", (req, res) => { res.json({ message: "space all" }) })
spaceRouter.get("/:spaceId", (req, res) => { res.json({ message: "space" }) })
spaceRouter.post("/element", (req, res) => { res.json({ message: "element" }) })
spaceRouter.delete("/element", (req, res) => { res.json({ message: "element" }) })
spaceRouter.get("/element", (req, res) => { res.json({ message: "element" }) })