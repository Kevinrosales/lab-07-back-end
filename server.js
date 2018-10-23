'use strict';

const express = require('express');
const cors = require('cors');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.get('/location', (request,response) => {
  const locationData = searchToLatLong(request.query.data);
  response.send(locationData);
});

function searchToLatLong(query) {
  const geoData = require('./data/geo.json');
  const location = new Location(geoData.results[0]);
  // location.search_query = query;
  return location;
}

function Location(data) {
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}

app.get('/weather', (request,response) => {
  const forcastData = searchWeatherData(request.query.data);
  response.send(forcastData);
});

function searchWeatherData(query){
  const weatherData = require('./data/darksky.json');
  const dailyWeather = [];
  const weather = weatherData.daily.data.forEach((item)=>{
    dailyWeather.push(new Weather(item));
  });
  // weather.search_query = query;
  console.log(dailyWeather);
  return dailyWeather;
}

function Weather(data){
  this.time = data.time;
  this.forecast = data.summary;
  console.log(data.summary);
}

app.get('/', function (request, response){
  throw new Error('status: 500', 'Sorry, somthing went wrong.')
})

app.listen(PORT, () => console.log(`App is up on ${PORT}`));
