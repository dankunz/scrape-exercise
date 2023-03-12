/* import { connectToDB, disconnectFromDB } from "./utils/database";
 */
/* import { CORS_ORIGIN } from "./constants";
import articleRoute from "./modules/article/article.route";*/
import advertisementRoute from "./src/advertisement/advertisement.router.js";
import cors from "cors";
import express from "express";
import helmet from "helmet";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());

app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use("/v1/advertisement", advertisementRoute);
app.use("/", (req, res) => {
  res.send("Home2");
});

const server = app.listen(PORT, async () => {
  console.log(`App is running at port: ${PORT}`);
});

const signals = ["SIGTERM", "SIGINT"];
