import express from "express";
import mysql from "mysql";
import cors from 'cors';
import { body, check, validationResult  } from "express-validator";

const port = 3000;
const app = express();

const corsOptions = {
    origin: "http://localhost:4200"
};

const dbConfig = {
    host: "localhost",
    user: "gedaspupa",
    password: "gedaspupa123",
    database: "scooters",
    multipleStatements: false,
};

const connection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
});

connection.connect((error) => {
    if (error) throw error;
    console.log("Successfully connected to the database.");
});

app.use(cors(corsOptions));
app.use(express.json());

app.get("/test-conn", (req, res) => {
    connection.query("SELECT 1 + 1 AS solution", (err, rows, fields) => {
        if (err) throw err;
        console.log("The solution is: ", rows[0].solution);
        res.status(200).send({ solution: rows[0].solution });
    });
});

// GET all scooters:
app.get("/scooters", (req, res) => {
    connection.query("SELECT * FROM paspirtukai", (err, rows, fields) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send({
                error_code: err.code,
                error_message: err.sqlMessage,
            });
        };
        try {
            console.log('Nice! You got all', rows.length, 'scooters!');
        } catch (err) {
            console.log(err.message);
        };
        res.status(200).send(rows);
    });
});

// GET one scooter:
app.get("/scooters/:id", (req, res) => {
    connection.query(
        "SELECT * FROM paspirtukai WHERE id = ?",
        req.params.id,
        (err, rows, fields) => {
            // console.log({...fields});
            if (err) {
                console.log(err.message);
                return res.status(500).send({
                    error_code: err.code,
                    error_message: err.sqlMessage,
                });
            };
            try {
                console.log('You got scooter with id: ', rows[0].id);
            } catch (err) {
                console.log(`Scooter with id ${req.params.id} not found!`);
            };
            if (rows.length === 0) {
                return res.status(404).send({
                    id: +req.params.id,
                    error_message: 'Record not found'
                });
            }
            res.status(200).send(rows);
        }
    );
});

// DELETE scooter:
app.delete("/scooters/:id", (req, res) => {
    connection.query(
        "DELETE FROM paspirtukai WHERE id = ? ",
        req.params.id,
        (err, rows, field) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send({
                    error_code: err.code,
                    error_message: err.sqlMessage,
                });
            };
            console.log("Deleted rows:", rows.affectedRows);
            if (!rows.affectedRows) return res.status(404).send({
                id: +req.params.id,
                error_message: 'Record not found'
            });
            res.status(204).send({
                id: +req.params.id,
                message: `Record with id ${req.params.id} deleted`
            });
        }
    );
});

// CREATE scooter:
app.post(
    "/scooters",

    //validation:
    check("name").isLength({min: 8, max: 8}).withMessage("Registration code must be 8 characters long!"),
    check("busy").custom(value => (value == 0 || value == 1) ? true : false).withMessage("'busy' field must be 0 or 1!"),
    check("last_use").isISO8601().toDate().withMessage("Not valid date format! Please enter: 'YYYY-MM-DD'."),
    check("total_ride").custom(value => (value >= 0 && value <= 9999.99) ? true : false).withMessage("Min: 0 km, max: 9999.99 km!"),
    
    (req, res) => {
        // validation:
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.errors[0].msg);
            return res.status(400).json(errors);
        }
        // query to DB:
        connection.query(
            "INSERT INTO paspirtukai (name, busy, last_use, total_ride) VALUES (?, ?, ?, ?)",
            [
                req.body.name,
                req.body.busy,
                req.body.last_use,
                req.body.total_ride,
            ],
            (err, rows, field) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).send({
                        error_code: err.code,
                        error_message: err.sqlMessage,
                    });
                };
                console.log("created: ", { id: rows.insertId, ...req.body });
                res.status(201).send({ id: rows.insertId, ...req.body });
            }
        );
    }
);

// UPDATE scooter:
app.put(
    "/scooters/:id",
    
    body('name').isLength({min: 8, max: 8}).withMessage("Registration code must be 8 characters long!"),

    //validation:
    check("name").isLength({min: 8, max: 8}).withMessage("Registration code must be 8 characters long!"),
    check("busy").custom(value => (value == 0 || value == 1) ? true : false).withMessage("'busy' field must be 0 or 1!"),
    check("last_use").isISO8601().toDate().withMessage("Not valid date format! Please enter: 'YYYY-MM-DD'."),
    check("total_ride").custom(value => (value >= 0 && value <= 9999.99) ? true : false).withMessage("Min: 0 km, max: 9999.99 km!"),

    (req, res) => {
        // validation:
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.errors[0].msg);
            return res.status(400).json(errors);
        }
        // query to DB:
        connection.query(
            "UPDATE paspirtukai SET name = ?, busy = ?, last_use = ?, total_ride = ? WHERE id = ?",
            [
                req.body.name,
                req.body.busy,
                req.body.last_use,
                req.body.total_ride,
                req.params.id,
            ],
            (err, rows, field) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).send({
                        error_code: err.code,
                        error_message: err.sqlMessage,
                    });
                };
                console.log("Updated rows:", rows === undefined ? 0 : rows.affectedRows);
                if (!rows.affectedRows) {
                    console.log(`Record with id ${req.params.id} not found!`);
                    return res.status(404).send({
                        id: +req.params.id,
                        error_message: 'Record not found'
                    });
                }
                res.status(201).send({id: +req.params.id, ...req.body});
            }
        ); 
    }
);

// TOTAL scooters:
app.get("/total", (req, res) => {
    connection.query("SELECT count(*) as total_scooters FROM paspirtukai", (err, rows, fields) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send({
                error_code: err.code,
                error_message: err.sqlMessage,
            });
        };
        console.log("Total scooters: ", rows[0].total_scooters);
        res.status(200).send({ total_scooters: rows[0].total_scooters });
    });
});

// TOTAL kilometers:
app.get("/kilometers", (req, res) => {
    connection.query("SELECT sum(total_ride) as total_kilometers FROM paspirtukai", (err, rows, fields) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send({
                error_code: err.code,
                error_message: err.sqlMessage,
            });
        };
        console.log("Total kilometers: ", rows[0].total_kilometers);
        res.status(200).send({ total_kilometers: rows[0].total_kilometers });
    });
});

app.listen(port, () =>
    console.log(`Port: ${port}!`)
);
