import * as dotenv from "dotenv";
dotenv.config()
import express from "express";
import { apiv1 } from "./routes/apiv1.js";

const PORT = process.env.APP_PORT || 5000
const app = express();

app.use("/apiv1", apiv1);


app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})