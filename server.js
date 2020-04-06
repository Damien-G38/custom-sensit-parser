// *********************************************************** //
// SENSIT DATA PARSER
// Server.js, where node app starts
// ------------------------------------------------------------
// Damien Gramusset
// *********************************************************** //


//--------------------------------------------------------------
// APP SETTINGS
//--------------------------------------------------------------
//Express app
const express = require("express");
const app = express();
const fs = require("fs");
app.use(express.json());
app.use(express.static("public"));
//Axios
const axios = require('axios');

//--------------------------------------------------------------
// EXTERNAL FILES
//--------------------------------------------------------------
const parser = require("./public/parser");
const praxedoRequest = fs.readFileSync("./public/praxedoRequest.xml").toString();

//--------------------------------------------------------------
// ROUTES
//--------------------------------------------------------------

// HOME PAGE
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// WEB SERVICE FOR DECODING
app.post("/decode", (req, res) => {
  // inform message received
  console.log("Decode request received.");
  res.sendStatus(200);

  //save eq body
  var reqBody = req.body;

  //call parser function
  var resultMap = parser(req.body);

  //For each resul in the map
  resultMap.forEach((value, key, map) => {
    //overwrite the json with the decoded value
    reqBody.metric = key;
    reqBody.value = value;

    //parameter the result back to OVH
    var clientServerOptions = {
      method: 'post',
      url: 'https://metrics:' + process.env.OVH_WRITE_TOKEN + '@opentsdb.gra1.metrics.ovh.net/api/put',
      data: JSON.stringify(reqBody),
      headers: {
        "Content-Type": "application/json"
      }
    };
    
    //send request vers OVH
    axios(clientServerOptions)
    .then( (res) => {
      console.log("Sending data to OVH : {" + key + ', ' + value + '}');
      console.log("SERVER RESPONSE: " + res.status)
    })
    .catch( (error) => {
      console.log("Sending data to OVH : {" + key + ', ' + value + '}');
      console.error("SERVER ERROR: " + error)
    });
  });
});


// WEB SERVICE FOR CREATING INTER IN PRAXEDO
app.post("/createInter", (req, res) => {
  // inform message received
  console.log("Create intervention request received.");
  res.sendStatus(200);
  
  //parameter the result back to OVH
  var clientServerOptions = {
    method: 'post',
    url: 'https://sb5.praxedo.com/eTech/services/cxf/v6/BusinessEventManager',
    data: praxedoRequest,
    auth: {
      username: "damien-webservices",
      password: "Praxedo38@"
    },
    headers: {
      "Content-Type": "application/xml"
    }
  };

  //send request vers OVH
  axios(clientServerOptions)
  .then( (res) => {
    console.log("Creating event in Praxedo.");
    console.log("SERVER RESPONSE: " + res.status)
    
    var startIndexID = res.data.indexOf("<id>");
    var endIndexID = res.data.indexOf("</id>");
    console.log("Created event number : " + res.data.substring(startIndexID + 4, endIndexID));
  })
  .catch( (error) => {
    console.log("Creating event in Praxedo.");
    console.error("SERVER ERROR: " + error);
  });
});


//--------------------------------------------------------------
// LISTENER
//--------------------------------------------------------------
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
