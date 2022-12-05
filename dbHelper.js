import * as dotenv from "dotenv";
dotenv.config();
import mysql from "mysql";

function makeNewDBconn() {
    const dbConn = mysql.createConnection({
        host: process.env.DB_URL,
        user: process.env.DB_U,
        password: process.env.DB_P,
        database: "barber"
    })
    return dbConn;
};

export {
    makeNewDBconn
}