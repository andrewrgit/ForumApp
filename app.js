const express = require("express");
const path = require("path");

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