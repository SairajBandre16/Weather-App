const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();

let date = new Date();

const apikey = 'Idu1lZ9K69IUi0ZVIgWAs9iMT7nUH8nQ'; 
const location = 'Mumbai';
const units = 'metric';
const timesteps = '1d';

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname));
app.set('view engine', 'ejs')

app.get('/', (request, response) => {

    const realTimeOptions = {
        method: 'GET',
        hostname: 'api.tomorrow.io',
        port: null,
        path: '/v4/weather/realtime?location=' + location + '&apikey=' + apikey + '&units=' + units,
        headers: {
          accept: 'application/json'
        }
      };
      
      const realTimeReq = https.request(realTimeOptions, function (res) {
        const chunks = [];
      
        res.on('data', function (chunk) {
          chunks.push(chunk);
        });
      
        res.on('end', function () {
          const realTimeData = JSON.parse(Buffer.concat(chunks));
          response.render('index', {date: date, realTimeData:realTimeData});
        });
      });
    realTimeReq.end();
    
    // const forecastOptions = {
    //     method: 'GET',
    //     hostname: 'api.tomorrow.io',
    //     port: null,
    //     path: '/v4/weather/forecast?location=' + location + '&apikey='+ apikey +'&units=' + units + '&timesteps=' +timesteps,
    //     headers: {
    //       accept: 'application/json'
    //     }
    //   };
      
    //   const forecastReq = https.request(forecastOptions, function (res) {
    //     const chunks = [];
      
    //     res.on('data', function (chunk) {
    //       chunks.push(chunk);
    //     });
      
    //     res.on('end', function () {
    //         const forecastData = JSON.parse(Buffer.concat(chunks));
    //     });
    //   });
    // forecastReq.end();

    // res.render('index', {date: date, realTimeData:realTimeData, forecastData:forecastData});
});

app.listen(3000, () => {
    console.log('App started on port 3000');
});