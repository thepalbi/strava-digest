const express = require("express");
const http = require('http');
const https = require('https');
const fetch = require('node-fetch');
const _ = require('lodash');

const app = express();
const hostname = '127.0.0.1';
const port = 3000;

const app_permissions = "activity:read_all";
const client_id = 43985;
const client_secret = "2041c4b02850ecee8724b430e640de138eb42379";

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
app.get("/refresh_token", (req,res) => {
    fetch("https://www.strava.com/oauth/token?" +
        `client_id=${client_id}&` +
        `client_secret=${client_secret}&` +
        `code=${env["me"]}&` +
        `grant=authorization_code`, {method: 'POST'})
        .then(res => res.json())
        .then(json => 
            {
                var accessToken = json.access_token;
                env["me_at"] = accessToken;
                res.end("ok!")
            })
});

app.get("/activities", (req, res) => {
    fetch('https://www.strava.com/api/v3/activities',
        {
            headers: { Authorization: `Bearer ${env["me_at"]}`}
        })
        .then(res2 => res2.json())
        .then(json => res.send(json));
});

app.get("/distances", (req, res) => {
    fetch(`http://${hostname}:${port}/activities`)
        .then(res2 => res2.json())
        .then(activities => {
            var summedDistances = _(activities)
                .map(activity => activity.distance)
                .sum();
            res.send({"summed_distances": summedDistances});
        });
});

app.listen(port, hostname, () => console.log(`Serving at http://${hostname}:${port}/`));

// TODO: Create mail sending service. (https://stackabuse.com/how-to-send-emails-with-node-js/)
// TODO: Add global error handling across express.
// TODO: Think of an email template to see the content.
// TODO: Automate or improve OAuth authentication flow.
// TODO: Move OAuth flow into a service-alike thingy.




