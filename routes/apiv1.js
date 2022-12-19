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
    //check if query params are present
    if (req.query.name) {
        let dbConn = makeNewDBconn();
        dbConn.connect();
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

apiv1.get('/getAppointments', (req, res) => {
    if(req.query?.timestamp != null){
        let dbRe = null;
        let dbConn = makeNewDBconn();
        dbConn.connect();
        //get all appointments that occur at and after the timestamp
        let [daySecs, weekSecs, monthSecs, yearSecs] = [86400,86400 * 7, 86400 * 30, 86400 * 365]
        let twoWeeksAgo = req.query.timestamp - (weekSecs * 2);
        let twoWeeksFromNow = req.query.timestamp + (weekSecs * 2);
        let getApptsWithCustomersQuery = 
            `SELECT a.appointment_id, a.customer, a.timestamp, c.name, c.phone
            FROM appointments a
            INNER JOIN customers c ON a.customer = c.id
            WHERE a.timestamp <= ${twoWeeksFromNow} OR a.timestamp >= ${twoWeeksAgo};
            `;
        // console.log("query to execute -->", getApptsWithCustomersQuery)
        dbConn.query(getApptsWithCustomersQuery, (err, rows, fields) => {
            if(err){
                res.status(500).send(err);
                dbConn.end();
            }else if( rows.length < 1){
                res.status(404).send("Query returned 0 results");
                dbConn.end();
            }else{
                dbRe = rows.map(appt => {
                    return {
                        time: appt.timestamp,
                        id: appt.appointment_id,
                        customer: {
                            id: appt.customer,
                            name: appt.name,
                            phone: appt.phone
                        }
                    }
                })
                res.status(200).send(dbRe);
                dbConn.end();
            }
        })
    }else{
        res.status(400).send("Missing query params");
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

apiv1.delete("/deleteAppointment",(req,res) => {
    console.log(req.query);
    if(req.query?.appointment_id != undefined){
        let dbConn = makeNewDBconn();
        dbConn.connect();
        let tempApptID = req.query.appointment_id;
        let deleteApptQuery = `DELETE FROM appointments WHERE appointment_id = ?;`;
        dbConn.query(deleteApptQuery, [tempApptID], (err, rows, fields) => {
            if(err){
                res.status(500).send(err);
                dbConn.end();
            }else{
                res.status(200).send(rows);
                dbConn.end();
            }
        })
    }else{
        res.status(400).send(`Query params not present! > appointment_id = ${req.query.appointment_id}`);
    }
})

apiv1.get("/allIssues", (req, res) => {
    let dbConn = makeNewDBconn();
    dbConn.connect();
    let getIssuesQuery = `SELECT * FROM issues;`;
    dbConn.query(getIssuesQuery, (err, rows, fields) => {
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
})

apiv1.post("/newIssue", (req, res) => {
    if(req.body?.title != undefined){
        let dbConn = makeNewDBconn();
        dbConn.connect();
        let tempTitle = req.body.title;
        let tempText = req.body.description;
        let makeIssueQuery = `INSERT INTO issues(body,title) VALUES (?,?);`;
        let params = [tempText, tempTitle]
        dbConn.query(makeIssueQuery, params,(err, rows, fields) => {
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
        res.status(400).send(`Missing query params! ${req.query.issue == undefined && "issue"}`);
    }
})

apiv1.delete("/deleteIssue", (req, res) => {
    console.log(req.body, req.params, req.query)
    if(req.query?.issue_id != undefined){
        let dbConn = makeNewDBconn();
        dbConn.connect();
        let tempId = req.query.issue_id;
        let deleteIssueQuery = `DELETE FROM issues WHERE issue_id = ?;`;
        dbConn.query(deleteIssueQuery, [tempId],(err, rows, fields) => {
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
        res.status(400).send(`Missing query params! ${req.query.issue_id == undefined && "issue_id"}`);
    }
})


export {
    apiv1
}