const express = require("express");
const path = require("path");
const { Client } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const responseTime = require("response-time");
const { createCipher } = require("crypto");

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

app.set("views", path.resolve(__dirname, "public"));
app.set("view engine", "ejs");



app.use(responseTime());

app.use(express.static(path.resolve(__dirname, "public")));
app.use(express.urlencoded( { extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
    if(req.cookies['token']){
        try{
            let tokenObj = jwt.verify(req.cookies['token'], privateKey);
            res.locals.username = tokenObj.username;
        }
        catch(err){
            console.log("error in checking user token every request " + err);
        }
    }
    next();
})


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
                    expiresIn: "1hr"
                });
                console.log("jwt token: " + token);
                res.cookie("token", token, {
                    maxAge: 3600 * 1000,
                    httpOnly: true
                })
                .json({
                    success: apiResponse.success,
                    username: username
                })
            }
            else{
                res.status(401).send(apiResponse);
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(400).send(err);
        })
    }
    else{
        res.status(401).json(new APIResponse(false, "Invalid login"));
    }
})

app.post("/api/createaccount", (req, res) => {
    if(req.body.username && req.body.password){
        createAccount(req.body.username, req.body.password)
        .then(apiResponse => {
            if(apiResponse.success){
                res.status(200).json(apiResponse);
            }
            else{
                res.status(400).json(apiResponse)
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
        res.status(400).send(new APIResponse(false, "Username and password required to create account"));
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

app.post("/api/logout", (req, res) => {
    if(res.locals.username){
        res.clearCookie("token").status(200).json(new APIResponse(true));
    }
    else{
        res.status(400).json(new APIResponse(false, "Token not valid, can't logout"));
    }
})


app.get("/api/topics/:category", (req, res) => {
        getTopics(req.params.category)
        .then( posts => {
            res.status(200).send(posts)
        })
        .catch( err =>{
            console.log(err);
            res.status(400).send(new APIResponse(false, "An error occured trying to retrieve topics"));
        })
})

app.get("/api/posts/:topicId", (req, res) => {
    getPosts(req.params.topicId)
    .then( posts => {
        res.status(200).send(posts)
    })
    .catch( err =>{
        console.log(err);
        res.status(400).send(new APIResponse(false, "An error occured trying to retrieve topics"));
    })
})

app.post("/api/createtopic/:categoryName", (req, res) => {
    if(!res.locals.username){
        res.status(403).send(new APIResponse(false, "You must be logged in to create topics"));
    }
    else if(req.body["title"]){
            createTopic(res.locals.username, req.body["title"], req.params.categoryName)
            .then( apiResponse => {
                res.status(200).send(apiResponse);
            })
    }
    else{
        res.status(400).send(new APIResponse(false, "Bad Request"));
    }
})

app.post("/api/createpost/:topicId", (req, res) => {
    if(!res.locals.username){
        res.status(403).send(new APIResponse(false, "You must be logged in to create posts"));
    }
    else if(req.body["post_content"] && req.body["topicId"]){
            createPost(res.locals.username, req.body["post_content"], req.body["topicId"])
            .then( apiResponse => {
                res.status(200).send(apiResponse);
            })
    }
    else{
        res.status(400).send(new APIResponse(false, "Bad Request"));
    }
})

app.get("/", (req, res) => {
    res.render("index");
})

app.get("/:file", (req, res) => {
    try{
        res.render(req.params.file);
    }
    catch(err){
        res.status(404).send("ERROR: not found!");
    }
})

app.get("*", (req, res) => {
    res.status(404).send();
})


async function createPost(username, postContent, topicId){
    let client = new Client({
        connectionString: connString,
        ssl: false
    });

    let QueryString = "INSERT INTO posts(accounts_username, post_date, post_content, topic_id) VALUES ($1, CURRENT_TIMESTAMP, $2, $3)";
    let values = [username, postContent, topicId]

    
    const apiResponse = await client.connect()
    .then(() => {
        return client.query(QueryString, values);
    })
    .then(res => {
        return new APIResponse(true);
    })
    .catch(err => {
        console.log(err);
        throw err;
    })
    client.end();
    return apiResponse;
}

async function createTopic(username, topicName, categoryname){
    let client = new Client({
        connectionString: connString,
        ssl: false
    });

    let QueryString = "INSERT INTO topics(accounts_username, title, categories_name) VALUES ($1, $2, $3)";
    let values = [username, topicName, categoryname]

    
    const apiResponse = await client.connect()
    .then(() => {
        return client.query(QueryString, values);
    })
    .then(res => {
        return new APIResponse(true);
    })
    .catch(err => {
        console.log(err);
        throw err;
    })
    client.end();
    return apiResponse;
}

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
            else{
                return new APIResponse(false, "Either the username or password is incorrect")
            }
        }
        catch(err) {
            console.log(err);
            throw err;
        }
    }
    else{
        return new APIResponse(false, "Either the username or password is incorrect");
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

    let queryString = "SELECT name, description FROM categories;";
    try{
        await client.connect();
        let result = await client.query(queryString);

        let categories = [];
        result.rows.forEach( cat => {
            categories.push({
                name: cat["name"],
                description: cat["description"]
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

async function getTopics(categoryName){
    let client = new Client({
        connectionString: connString,
        ssl: false
    });

    let queryString = "SELECT accounts_username, title, id FROM topics WHERE categories_name = $1 ORDER BY id DESC;";
    let values = [categoryName];
    try{
        await client.connect();
        let result = await client.query(queryString, values);

        let topics = [];
        result.rows.forEach( topic => {
            topics.push({
                accountsUsername: topic["accounts_username"],
                title: topic["title"],
                topicId: topic["id"]
            })
        })

        client.end();
        return topics;
    }
    catch(err){
        console.log(err);
        throw err;
    }

}

async function getPosts(topicId){
    let client = new Client({
        connectionString: connString,
        ssl: false
    });

    let queryString = "SELECT accounts_username, post_content FROM posts WHERE topic_id = $1 ORDER BY post_date ASC;";
    let values = [topicId];
    try{
        await client.connect();
        let result = await client.query(queryString, values);

        let posts = [];
        result.rows.forEach( post => {
            posts.push({
                accountsUsername: post["accounts_username"],
                postContent: post["post_content"]
            })
        })

        client.end();
        return posts;
    }
    catch(err){
        console.log(err);
        throw err;
    }

}