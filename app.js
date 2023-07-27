const express = require("express");
const https = require("https");
const mongoose = require("mongoose")

const app = express();
const url = 'mongodb+srv://Amey:uB2MbAKKujq7yd29@weather.fkb9bxg.mongodb.net/?retryWrites=true&w=majority';

const apikey = 'Idu1lZ9K69IUi0ZVIgWAs9iMT7nUH8nQ'; 
const location = 'Mumbai';
const units = 'metric';
const timesteps = '1d';
const date = new Date();

mongoose.connect(url);

const realTimeSchema = new mongoose.Schema({
  time: Date,
  location: String,
  latitude: Number,
  longitude: Number,
  values: Object
});

const RealTime = mongoose.model("RealTime", realTimeSchema);

const forecastSchema = new mongoose.Schema({
  location: String,
  latitude: Number,
  longitude: Number,
  timelines: Object
})

const Forecast = mongoose.model("Forecast", forecastSchema);

app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname));
app.set('view engine', 'ejs')

function getRealtimeData(apikey, location, units) {

  const realTimeOptions = {
    method: 'GET',
    hostname: 'api.tomorrow.io',
    port: null,
    path: `/v4/weather/realtime?location=${location}&apikey=${apikey}&units=${units}`,
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
      const dirty = JSON.parse(Buffer.concat(chunks));
      const realTimeData = new RealTime({
        time: dirty.data.time,
        loction: dirty.location.name,
        latitude: dirty.location.lat,
        longitude: dirty.location.lon,
        values: dirty.data.values
      }); 
      realTimeData.save()     
    });
  });
realTimeReq.end();
}

function getForecastData(apikey, location, units, timesteps) {

 const forecastOptions = {
        method: 'GET',
        hostname: 'api.tomorrow.io',
        port: null,
        path: `/v4/weather/forecast?location=${location}&apikey=${apikey}&units=${units}&timesteps=${timesteps}`,
        headers: {
          accept: 'application/json'
        }
      };
      
      const forecastReq = https.request(forecastOptions, function (res) {
        const chunks = [];
      
        res.on('data', function (chunk) {
          chunks.push(chunk);
        });
      
        res.on('end', function () {
            const dirty = JSON.parse(Buffer.concat(chunks));
            const forecastData = new Forecast({
              location: dirty.name,
              latitude: dirty.lat,
              longitude: dirty.lon,
              timelines: dirty.timelines
            })
            forecastData.save();
        }) ;
      });
    forecastReq.end();
}

// getRealtimeData(apikey, location, units);
// getForecastData(apikey, location, units, timesteps);

app.get('/', async (request, response) => {
  const realTimeData = await RealTime.findOne({time: {$lte: date}}).exec();
  const forecastData = await Forecast.find().exec();
  response.render('index', {date: date, realTimeData: realTimeData, forecastData: forecastData});
});

app.listen(3000, () => {
    console.log('App started on port 3000');
});