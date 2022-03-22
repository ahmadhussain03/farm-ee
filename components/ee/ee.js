const express = require("express")
const router = express.Router()
const ee = require('@google/earthengine');
const privateKey = require('./key.json')

const EE_MAP_PATH = 'https://earthengine.googleapis.com/map';

var colors = ['#007300', '#127705', '#237a0a', '#357e0e', '#468213', '#588618', '#6a891d', '#7b8d22', '#8d9127', '#9e952b', '#b09830', '#c19c35', '#d3a03a', '#e5a33f', '#f6a744', '#fca544', '#f69c3f', '#f0933a', '#ea8b35', '#e58230', '#df792b', '#d97127', '#d36822', '#cd5f1d', '#c75618', '#c14e13', '#bc450e', '#b63c0a', '#b03405', '#aa2b00']
colors = colors.reverse()
ee.data.authenticateViaPrivateKey(
  privateKey,
  () => {
    console.log('Authentication successful.');
    ee.initialize(
      null, null,
      () => {
        //////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////

        router.get('/test', (req, res) => {
          res.send("TESTED")
        })

        router.post('/ndvi', (request, response) => {

          const body = request.body
          response.set('Content-Type', 'text/plain')

          var geometry = new ee.Geometry.Polygon(JSON.parse(body.geometry));
          const today = new Date(Date.now())
          var yesterday = new Date(Date.now() - 86400000 * 10)

          var S2_SR = ee.ImageCollection('COPERNICUS/S2_SR')
            .filterBounds(geometry)
            .filterDate(
              yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1) + '-' + yesterday.getDate(),
              today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
            );
          var addNDVI = function (image) {
            var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
            return image.addBands(ndvi);
          };
          var S2_NDVI = S2_SR.map(addNDVI);
          var recent_S2 = ee.Image(S2_NDVI.sort('system:time_start', false).first().clip(geometry));

          var ndvi = recent_S2.normalizedDifference(['B8', 'B4']);
          ndvi = ndvi.clip(geometry)
          var maxReducer = ee.Reducer.max();
          var minReducer = ee.Reducer.min();
          var meanReducer = ee.Reducer.mean();

          var theMax = ndvi.reduceRegion(maxReducer, geometry).getInfo();
          var theMin = ndvi.reduceRegion(minReducer, geometry).getInfo()
          var theMean = ndvi.reduceRegion(meanReducer, geometry).getInfo()

          ndvi.getMap(
            { min: -1, max: 1, palette: colors },
            (map, ERR) => {

              if (ERR) response.send(ERR)
              else response.send({
                url: `https://earthengine.googleapis.com/v1beta/${map.mapid}/tiles/{z}/{x}/{y}`,
                max: theMax,
                min: theMin,
                mean: theMean,

              })

            });

          ////////////////////////////////////////////////////////////////////////////////////////
          ////////////////////////////////////////////////////////////////////////////////////////
        })
        router.post('/ndre', (request, response) => {

          const body = request.body
          response.set('Content-Type', 'text/plain')


          var geometry = new ee.Geometry.Polygon(JSON.parse(body.geometry));
          const today = new Date(Date.now())
          var yesterday = new Date(Date.now() - 86400000 * 10)

          var S2_SR = ee.ImageCollection('COPERNICUS/S2_SR')
            .filterBounds(geometry)
            .filterDate(
              yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1) + '-' + yesterday.getDate(),
              today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
            );
          var addndre = function (image) {
            var ndre = image.normalizedDifference(['B8', 'B5']).rename('ndre');
            return image.addBands(ndre);
          };
          var S2_ndre = S2_SR.map(addndre);
          var recent_S2 = ee.Image(S2_ndre.sort('system:time_start', false).first().clip(geometry));

          var ndre = recent_S2.normalizedDifference(['B8', 'B5']);
          ndre = ndre.clip(geometry)

          var maxReducer = ee.Reducer.max();
          var minReducer = ee.Reducer.min();
          var meanReducer = ee.Reducer.mean();

          var theMax = ndre.reduceRegion(maxReducer, geometry).getInfo();
          var theMin = ndre.reduceRegion(minReducer, geometry).getInfo()
          var theMean = ndre.reduceRegion(meanReducer, geometry).getInfo()

          ndre.getMap(
            { min: -1, max: 1, palette: colors },
            (map, ERR) => {

              if (ERR) response.send(ERR)
              else response.send({
                url: `https://earthengine.googleapis.com/v1beta/${map.mapid}/tiles/{z}/{x}/{y}`,
                max: theMax,
                min: theMin,
                mean: theMean,

              })

            });

          ////////////////////////////////////////////////////////////////////////////////////////
          ////////////////////////////////////////////////////////////////////////////////////////
        })


        router.post('/msavi', (req, res) => {
          const body = req.body
          res.set('Content-Type', 'text/plain')

          var geometry = new ee.Geometry.Polygon(JSON.parse(body.geometry));
          const today = new Date(Date.now())
          var yesterday = new Date(Date.now() - 86400000 * 10)

          var S2_SR = ee.ImageCollection('COPERNICUS/S2_SR')
            .filterBounds(geometry)
            .filterDate(
              yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1) + '-' + yesterday.getDate(),
              today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
            );

          var addmsavi = function (image) {
            var msavi = image.expression(
              '(2 * NIR + 1 - sqrt((2 * NIR + 1) * (2 * NIR + 1) - 8 * (NIR - R))) / 2', {
              'NIR': image.select('B8'),
              'R': image.select('B4')
            }
            ).rename('msavi');
            return image.addBands(msavi);
          };
          var S2_msavi = S2_SR.map(addmsavi);
          var recent_S2 = ee.Image(S2_msavi.sort('system:time_start', false).first().clip(geometry));

          var msavi = recent_S2.expression(
            '(2 * NIR + 1 - sqrt((2 * NIR + 1) * (2 * NIR + 1) - 8 * (NIR - R))) / 2', {
            'NIR': recent_S2.select('B8'),
            'R': recent_S2.select('B4')
          }
          );
          msavi = msavi.clip(geometry)

          var maxReducer = ee.Reducer.max();
          var minReducer = ee.Reducer.min();
          var meanReducer = ee.Reducer.mean();

          var theMax = msavi.reduceRegion(maxReducer, geometry).getInfo();
          var theMin = msavi.reduceRegion(minReducer, geometry).getInfo()
          var theMean = msavi.reduceRegion(meanReducer, geometry).getInfo()

          msavi.getMap(
            { min: -1, max: 1, palette: colors },
            (map, ERR) => {

              if (ERR) res.send(ERR)
              else res.send({
                url: `https://earthengine.googleapis.com/v1beta/${map.mapid}/tiles/{z}/{x}/{y}`,
                max: theMax,
                min: theMin,
                mean: theMean,

              })

            });

        })

        ////////////////////////////////////////////////////////////////////////////////////////
        //ReCL Index
         router.post('/recl', (req, res) => {
          const body = req.body
          res.set('Content-Type', 'text/plain')

          var geometry = new ee.Geometry.Polygon(JSON.parse(body.geometry));
          const today = new Date(Date.now())
          var yesterday = new Date(Date.now() - 86400000 * 10)

          var S2_SR = ee.ImageCollection('COPERNICUS/S2_SR')
            .filterBounds(geometry)
            .filterDate(
              yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1) + '-' + yesterday.getDate(),
              today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
            );

          var addrecl = function (image) {
            var recl = image.expression(
              '((NIR/RED)-1)', {
              'NIR': image.select('B8'),
              'RED': image.select('B4')
            }
            ).rename('recl');
            return image.addBands(recl);
          };
          var S2_recl = S2_SR.map(addrecl);
          var recent_S2 = ee.Image(S2_recl.sort('system:time_start', false).first().clip(geometry));

          var recl = recent_S2.expression(
            '((NIR/RED)-1)', {
            'NIR': recent_S2.select('B8'),
            'RED': recent_S2.select('B4')
          }
          );
          recl = recl.clip(geometry)

          var maxReducer = ee.Reducer.max();
          var minReducer = ee.Reducer.min();
          var meanReducer = ee.Reducer.mean();
          
          var theMax = recl.reduceRegion(maxReducer, geometry).getInfo();
          var theMin = recl.reduceRegion(minReducer, geometry).getInfo()
          var theMean = recl.reduceRegion(meanReducer, geometry).getInfo()

          recl.getMap(
            { min: -1, max: 1, palette: colors },
            (map, ERR) => {

              if (ERR) res.send(ERR)
              else res.send({
                url: `https://earthengine.googleapis.com/v1beta/${map.mapid}/tiles/{z}/{x}/{y}`,
                max: theMax,
                min: theMin,
                mean: theMean,

              })

            });

        })
        


        router.get('/test', (req, response) => {

          response.send("EE TESTED")

        })


      },
      (err) => {
        console.log(err);
        console.log(
          `Please make sure you have created a service account and have been approved.`);
        });
    },
    (err) => {
      console.log(err);
    });
  
    module.exports = router