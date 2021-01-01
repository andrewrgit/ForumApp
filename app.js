const express = require("express");
const path = require("path");
const { Client } = require("pg");

const app = express();

var port = process.env.PORT;
if(!port){
    port = 3000;
}

app.use(express.static(path.resolve(__dirname, "public")));
app.use(express.urlencoded( { extended: true }));
app.use(express.json());

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
})

app.post("/api/login", (req, res) => {
    if(req.body.username == "phil"){
        console.log("name is phil");
        res.status(200).send("nice phil");
    }
})

app.post("/api/createaccount", (req, res) => {
    if(req.body.username == "phil"){
        console.log("phil already exists in the db");
        res.status(400).send("username 'phil' already exists");
        return;
    }
})