import express, { Router } from "express";
import request from "supertest";

const app = express();
const router = Router();

router.use("/", (req, res) => res.send("root"));
router.get("/*", (req, res) => res.send("default"));

app.use("/v1", router);

console.log(router.stack);

(async () => {
  const response = await request(app).get("/v1/ezfazef");
  console.log(response.status);
  console.log(response.text);
})();
