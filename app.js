'use strict'

var bodyParser = require('body-parser');
var express = require('express');

var app = express();

var pais_routes = require('./routes/pais')
var director_routes = require('./routes/director')
var pelicula_routes = require('./routes/pelicula')

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(function(req , res, next){
    //Puede ser consumida desde cualquier lugar
    res.header('Access-Control-Allow-Origin','*');
    //Cabeceras permitidas
    res.header('Access-Control-Allow-Header','X-API-KEY,Origin,X-Requested-With,Content-Type,Accept,Access-Control-Request-Method');
    //Metodos Permitidos
    res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
    res.header('Allow','GET,POST,PUT,DELETE');
    next();
});

app.use('/api', pais_routes);
app.use('/api', director_routes);
app.use('/api', pelicula_routes);


module.exports = app;