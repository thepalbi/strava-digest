const express = require("express");
const http = require('http');
const https = require('https');

const app = express();
const hostname = '127.0.0.1';
const port = 3000;

const app_permissions = "activity:read_all";
const client_id = 43985;

const env = {};

app.get("/authorize", (req, res) => {
    res.redirect(`http://www.strava.com/oauth/authorize?client_id=${client_id}&response_type=code&redirect_uri=http://${hostname}:${port}/permission_granted&approval_prompt=force&scope=${app_permissions}`);
});

app.get("/permission_granted", (req,res) => {
    console.log(`The calling url is ${req.url}`);
    var api_key_for_user = req.query.code;
    env["me"] = api_key_for_user;
    res.end("Ok!");
});

// TODO: Missing refresh OAuth token. Read about why it's needed.

app.get("/activities", (req, res) => {
    https.get("https://www.strava.com/api/v3/activities", {
        headers: {
            Authorization: `Bearer ${env["me"]}`
        }
    }, (res) => {
        console.log(`Request working in background ${req}`);
        res.on("data", (chunk) => {
            console.log(`Incoming chunk of data: ${chunk}`);
        })
    });
    res.end("Working on bg")
});

app.listen(port, hostname, () => console.log(`Serving at http://${hostname}:${port}/`));




