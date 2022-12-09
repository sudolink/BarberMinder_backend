import { Router } from "express";
import { makeNewDBconn } from "../dbHelper.js";

const apiv1 = Router();


apiv1.get("/getCustomers", (req, res) => {
    let dbConn = makeNewDBconn();
    dbConn.connect();
    let dbResponse = { status: 500, data: null };
    dbConn.query("SELECT * FROM customers", (err, rows, fields) => {
        if (err) {
            res.status(500).send(err);
            console.log(err);
            dbConn.end();
        } else {
            if (rows.length < 1) {
                res.status(404).send("Query returned 0 results");
                dbConn.end();
            } else {
                res.status(200).send(rows);
                dbConn.end();
            }
        }
    })
})

apiv1.get("/getCustomerLike/", (req, res) => {
    let dbConn = makeNewDBconn();
    dbConn.connect();
    //check if query params are present
    if (req.query.name) {
        dbConn.query(`SELECT name,id FROM customers WHERE name LIKE '%${req.query.name}%'`, (err, rows, fields) => {
            if (err) {
                res.status(500).send(err);
                console.log(err);
                dbConn.end();
            }
            else if(rows.length < 1) {
                res.status(404).send("Query returned 0 results");
                dbConn.end();
            } else {
                res.status(200).send(rows);
                dbConn.end();
            }
        })
    } else {
        res.status(400).send("Missing query params");
        dbConn.end();
    }
})

apiv1.get("/getCustomerById/", (req, res) => {
    //check if query params are present
    if (req.query.id) {
        let dbConn = makeNewDBconn();
        dbConn.connect();
        dbConn.query(`SELECT * FROM customers WHERE id = ${req.query.id}`, (err, rows, fields) => {
            if (err) {
                res.status(500).send(err);
                console.log(err);
                dbConn.end();
            }else if(rows.length < 1){
                res.status(404).send("Query returned 0 results");
                dbConn.end();
            }else {
                res.status(200).send(rows);
                dbConn.end();
            }
        })
    } else {
        res.status(400).send("Missing query params");
    }
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

apiv1.get("/getAppointmentsForDay", (req, res) => {
    console.log(req.query)
    if(req.query?.date != undefined){
        let dbConn = makeNewDBconn();
        dbConn.connect();
        let getApptsQuery = `SELECT * FROM appointments WHERE date = "${req.query.date}";`;
        dbConn.query(getApptsQuery, (err, rows, fields) => {
            if(err){
                res.status(500).send(err);
                dbConn.end();
            }else{
                if(rows.length < 1){
                    res.status(404).send("Query returned 0 results");
                    dbConn.end();
                }else{
                    res.status(200).send(rows);
                    dbConn.end();
                }
        }
        })
    }else{
        res.status(400).send("Missing query params");
    }
})

apiv1.post("/makeAppointment", (req, res) => {
    console.log(req.query)
    if(req.query?.timestamp != undefined && req.query?.customer_id != undefined){
        let dbConn = makeNewDBconn();
        dbConn.connect();
        let makeApptQuery = `INSERT INTO appointments(customer, timestamp) VALUES (${req.query.customer_id}, "${req.query.timestamp}");`;
        dbConn.query(makeApptQuery, (err, rows, fields) => {
            if(err){
                res.status(500).send(err);
                console.log(err);
                dbConn.end();
            }else{
                res.status(200).send(rows);
                dbConn.end();
            }
        })
    }else{
        res.status(400).send(`Missing query params! ${req.query.timestamp == undefined && "timestamp"} ${req.query.customer_id == undefined && "customer_id"}}`);
    }
})

export {
    apiv1
}