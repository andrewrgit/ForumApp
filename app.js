const express = require("express");
const path = require("path");
const { Client } = require("pg");
const bcrypt = require("bcrypt");

const app = express();

//Setup port
var port = process.env.PORT;
if(!port){
    port = 3000;
}

//Setup db conn string
var connString = process.env.DATABASE_URL;
if(!connString){
    connString = "postgres://postgres:password@localhost:5432/forumDb";
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
    else
    console.log("Youre not phil")
})

app.post("/api/createaccount", (req, res) => {
    if(req.body.username && req.body.password){
        try{
            if(createAccount(req.body.username, req.body.password)){
                res.sendStatus(200);
            }
            else{
                res.status(400).send({
                    message: "Account already exists"
                })
            }
        }
        catch (err){
            res.status(400).send({
                message: err
            });
        }
    }
})



function createAccount(username, password){
    let client = new Client({
        connectionString: connString,
        ssl: false
    });

    client.connect();

    let checkUsernameQueryString = "SELECT username FROM accounts WHERE username = $1;";
    let values = [username]

    //Check if username already exists
    let doesAccountExist = false;
    client.query(checkUsernameQueryString, values, (err, res) => {
        if(err) throw err;
        if(res.rowCount > 0){
            doesAccountExist = true;
        }
    })
    if(doesAccountExist) return false;

    //If not, hash password and create account
    bcrypt.hash(password, 10).then( hash => {
        let queryString = "INSERT INTO accounts (username, password) VALUES ($1, $2);";
        let values = [username, password];

        client.query(queryString, values, (err, res) => {
            if(err) throw err;
        })
    })
}