const { static } = require('express');
const express = require('express');
const path = require("path");
const fs = require("fs");

const manager = require("./node/jsonManager");

const app = express();
const port = 8080;

app.use(express.static('html'));
app.use(express.static('js'));
app.use(express.static('css'));

app.get('/', (req, res) => {
    res.send("no");
})

app.get('/json/:id', (req,res) => {
    res.send(manager.load(__dirname, req.params.id));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})