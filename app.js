const express = require("express");
const path = require("path");
const { Client } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();


class APIResponse{
    constructor(success, message){
        this.success = success;
        this.message = message;
    }
}


//Setup env variables
const port = process.env.PORT || 3000;
const connString = process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432/forumDb";
const privateKey = process.env.PRIVATE_KEY || "testprivatekey";



app.use(express.static(path.resolve(__dirname, "public")));
app.use(express.urlencoded( { extended: true }));
app.use(express.json());
app.use(cookieParser());


function checkTokens(req, res, next){
    console.log(req.cookies)
    console.log("lol");
    next();
}


app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
})

app.post("/api/login", (req, res) => {

    const {username, password} = req.body;
    if(username && password){
        loginAccount(username, password)
        .then(apiResponse => {
            if(apiResponse.success){               
                const token = jwt.sign({ username }, privateKey, {
                    expiresIn: 30
                });
                console.log("jwt token: " + token);
                res.cookie("token", token, {
                    maxAge: 30 * 1000,
                    httpOnly: true
                })
                res.status(200).send("logged in successfully, assigning jwt");
            }
            else{
                res.status(401).send(apiResponse.message);
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(400).send(err);
        })
    }
    else{
        res.status(401).send("invalid login");
    }
})

app.post("/api/createaccount", (req, res) => {
    if(req.body.username && req.body.password){
        createAccount(req.body.username, req.body.password)
        .then(apiResponse => {
            if(apiResponse.success){
                console.log("sending OK status");
                res.sendStatus(200);
            }
            else{
                res.status(400).send({
                    message: apiResponse.message
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(400).send({
                message: err
            });
        })
    }
    else{
        res.status(400).send("Username and password required when creating account");
    }
})

app.get("/api/categories", (req, res) => {
    try{
        jwt.verify(req.cookies['token'], privateKey);
    }
    catch(err){
        res.status(403).send(new APIResponse(false, "invalid token"));
        return;
    }

    getCategories()
    .then( categories => {
        res.status(200).send(categories)
    })
})


async function loginAccount(username, password){
    if(await doesUsernameExist(username)){
        let client = new Client({
            connectionString: connString,
            ssl: false
        });

        try {
            await client.connect();

            let queryString = "SELECT password FROM accounts WHERE username = $1;";
            let values = [username];
            const result = await client.query(queryString, values);

            const isPasswordMatching = await bcrypt.compare(password, result.rows[0].password);
            client.end();
            if(isPasswordMatching){
                return new APIResponse(true);
            }
        }
        catch(err) {
            console.log(err);
            throw err;
        }
    }
    else{
        return new APIResponse(false, "Username does not exist");
    }
}

async function createAccount(username, password){

    if(await doesUsernameExist(username)){
        return new APIResponse(false, "Username already exists");
    }
    else{
        let client = new Client({
            connectionString: connString,
            ssl: false
        });

        const wasCreated = await client.connect()
        .then(() => {
            return bcrypt.hash(password, 12)
        })
        .then( hash => {
            let queryString = "INSERT INTO accounts (username, password) VALUES ($1, $2);";
            let values = [username, hash];
            
            return client.query(queryString, values);
        })
        .then(() => {
            return new APIResponse(true);
        })
        .catch(err => {
            console.log(err);
            throw err;
        })
        client.end();
        return wasCreated;
    }
}

async function doesUsernameExist(username){
    let client = new Client({
        connectionString: connString,
        ssl: false
    });

    let checkUsernameQueryString = "SELECT username FROM accounts WHERE username = $1;";
    let values = [username]

    
    const exists = await client.connect()
    .then(() => {
        return client.query(checkUsernameQueryString, values);
    })
    .then(res => {
        if(res.rows.length == 0){
            return false;
        }
        else{
            return true;
        }
    })
    .catch(err => {
        console.log(err);
        throw err;
    })
    client.end();
    return exists;
}

async function getCategories(){
    let client = new Client({
        connectionString: connString,
        ssl: false
    });

    let queryString = "SELECT name FROM categories;";
    try{
        await client.connect();
        let result = await client.query(queryString);

        let categories = [];
        result.rows.forEach( cat => {
            categories.push({
                name: cat["name"]
            })
        })

        client.end();
        return categories;
    }
    catch(err){
        console.log(err);
        throw err;
    }

}