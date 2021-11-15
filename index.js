const express = require("express");
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
var jsonString = '';

var $ = jQuery = require('jquery')(window);

const app = express();

app.use(express.urlencoded({extended: false}));


var proxyServer = 'https://cors-coronacoc-v2.herokuapp.com/';

app.get("/", (req, res) => {
  $.ajax({
    type: "GET",
    url: proxyServer+"https://apiv2.corona-live.com/domestic-init.json", // Using myjson.com to store the JSON
    success: function(result) {
      var data = new Object();
      data.cases = result.stats.cases[0];
      data.newCases = result.stats.cases[1];
      data.deaths = result.stats.deaths[0];
      data.newDeaths = result.stats.deaths[1];
      data.severe = result.stats.patientsWithSevereSymptons[0];
      data.newSevere = result.stats.patientsWithSevereSymptons[1];

      var jsonString= JSON.stringify(data);
      
      console.log(jsonString);
      res.send(jsonString);
    }
  });

});

app.get("/api", (req, res) => {
  //
  
  
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

