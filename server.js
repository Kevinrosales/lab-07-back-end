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



/*************    WEATHER API  *******************/

app.get('/weather', getWeather);


function getWeather(request, response) {

  const _URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  return superagent.get(_URL)
    .then(result => {

      const weatherSummaries = [];

      result.body.daily.data.forEach(day => {
        const summary = new Weather(day);
        weatherSummaries.push(summary);
      });

      response.send(weatherSummaries);

    })
    .catch(error => handleError(error, response));
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

/*************    YELP API  *******************/

app.get('/yelp', getYelp);

function getYelp (request, response){

  const _URL = `https://api.yelp.com/v3/businesses/search/${process.env.YELP_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
}

return superagent.get(_URL)
  .then(result => {
    const allBusinesses = [];

    // result.body.daily.data.forEach(day => {
    //   const summary = new Weather(day);
    //   weatherSummaries.push(summary);
    // });

    response.send(allBusinesses);
  });

//we need 'name', 'image_url', 'price', 'rating', 'url'

function Business(local){
  this.name = local.name;
  this.imgUrl = local.image_url;
  this.price = local.price;
  this.rating = local.rating;
  this.url = local.url;
}

/*************    ERROR HANDLER  *******************/

function handleError(err, res) {
  console.error('ERR', err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

app.listen(PORT, () => console.log(`App is up on ${PORT}`));
