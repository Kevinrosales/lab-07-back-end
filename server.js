'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());

/*************    LOCATION API  *******************/

app.get('/location', (request,response) => {
  getLocation(request.query.data)
    .then( locationData => response.send(locationData) )
    .catch( error => handleError(error, response) );
});


function getLocation(query) {

  const _URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(_URL)
    .then( data => {
      if ( ! data.body.results.length ) { throw 'No Data'; }
      else {
        let location = new Location(data.body.results[0]);
        location.search_query = query;
        return location;
      }
    });
}

function Location(data) {
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}

// app.get('/location', (request,response) => {
//   const locationData = searchToLatLong(request.query.data);
//   response.send(locationData);
// });

// function searchToLatLong(query) {
//   const geoData = require('./data/geo.json');
//   const location = new Location(geoData.results[0]);

//   return location;
// }

// function Location(data) {
//   this.formatted_query = data.formatted_address;
//   this.latitude = data.geometry.location.lat;
//   this.longitude = data.geometry.location.lng;
// }


/*************    WEATHER API  *******************/

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

  return dailyWeather;
}

function Weather(data){
  this.time = new Date(data.time * 1000).toString().slice(0, 15);
  this.forecast = data.summary;
  console.log(data.summary);
}


function handleError(err, res) {
  console.error('ERR', err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

app.listen(PORT, () => console.log(`App is up on ${PORT}`));
