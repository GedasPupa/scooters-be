import express from "express";
import mysql from "mysql";
import cors from 'cors';

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


// app.get("/total", (req, res) => {
//     connection.query("SELECT count(*) as total_records FROM books_table", (err, rows, fields) => {
//         if (err) throw err;
//         console.log("Total records: ", rows[0].total_records);
//         res.status(200).send({ total_records: rows[0].total_records });
//     });
// });

// app.get("/category/:cat", (req, res) => {
//     connection.query("SELECT count(*) as category_count FROM books_table WHERE category = (?) GROUP BY category",
//     req.params.cat,
//     (err, rows, fields) => {
//         if (err) throw err;
//         console.log("Category count: ", rows[0].category_count);
//         res.status(200).send({ category_count: rows[0].category_count });
//     });    
// });

// GET all
app.get("/scooters", (req, res) => {
    connection.query("SELECT * FROM paspirtukai", (err, rows, fields) => {
        if (err) throw err;
        res.status(200).send(rows);
    });
});
// GET one
app.get("/scooters/:id", (req, res) => {
    connection.query(
        "SELECT * FROM paspirtukai WHERE id = ?",
        req.params.id,
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).send(rows);
        }
    );
});
// CREATE one
app.post("/scooters", (req, res) => {
    connection.query(
        "INSERT INTO paspirtukai (`name`, `busy`, `last_use`, `total_ride`) VALUES (?, ?, ?, ?)",
        [
            req.body.name,
            req.body.busy,
            req.body.last_use,
            req.body.total_ride,
        ],
        (err, rows, field) => {
            if (err) throw err;
            console.log("created: ", { id: rows.insertId, ...req.body });
            res.status(201).send({ id: rows.insertId, ...req.body });
        }
    );
});
// UPDATE one
app.put("/scooters/:id", (req, res) => {
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
            if (err) throw err;
            console.log("updated: ", { rows });
            res.status(201).send({id: parseInt(req.params.id), ...req.body});
        }
    ); 
});
// DELETE one
app.delete("/scooters/:id", (req, res) => {
    connection.query(
        "DELETE FROM paspirtukai WHERE id=?",
        req.params.id,
        (err, rows, field) => {
            if (err) throw err;
            console.log("deleted: ", rows);
            res.status(204).send();
        }
    );
});

app.listen(port, () =>
    console.log(`Port: ${port}!`)
);


