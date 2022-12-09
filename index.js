import * as dotenv from "dotenv";
dotenv.config()
import express from "express";
import { apiv1 } from "./routes/apiv1.js";

const PORT = process.env.APP_PORT || 5000
const app = express();

function requestLogger(req, res, next) {
    console.log('Received a request:', req.method, req.path);
    next();
}

//built in body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(requestLogger);
app.use("/api/v1", apiv1);

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})