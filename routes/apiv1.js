import { Router } from "express";
import { makeNewDBconn } from "../dbHelper.js";

const apiv1 = Router();


apiv1.get("/getCustomers", (req, res) => {
    console.log("Apiv1 req")
    let dbConn = makeNewDBconn();
    dbConn.connect();
    let dbResponse = { status: 500, data: null };
    dbConn.query("SELECT * FROM customers", (err, rows, fields) => {
        if (err) {
            res.status(500).send(err);
            dbConn.end();
        } else {
            if (rows.length < 1) {
                res.status(404).send("Query returned 0 results");
                dbConn.end();
            } else {
                res.status(200).send(rows[0]);
                dbConn.end();
            }
        }
    })
})

apiv1.post("/makeNewCustomer", (req, res) => {
    console.log(req.query)
    if (req?.query?.name != undefined && req?.query?.phone != undefined) {
        let dbConn = makeNewDBconn();
        dbConn.connect();
        let makeCustomerQuery = `INSERT INTO customers(name, phone_number, email) VALUES ("${req.query.name}", ${req.query.phone}, "${req.query.email}");`;
        dbConn.query(makeCustomerQuery, (err, rows, fields) => {
            if (err) {
                res.status(500).send(err);
            } else {
                console.log(rows[0]);
                res.status(200).send(rows);
            }
        })
    }
    else {
        res.status(404).send(`Missing data fields!`);
    }
})

apiv1.post("/makeAppointment", (req, res) => {
    if (req?.query?.time != undefined && req?.query?.customer != undefined) {
        res.status(200).send("not implemented yet");
    }
})

export {
    apiv1
}