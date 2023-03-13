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
  res.send("Initial");
});

const server = app.listen(PORT, async () => {
  console.log(`Server is running at port: ${PORT}`);
  console.log(`Please wait until a database is established...`);
});
