'use strict';

var mongoose = require('mongoose');
var config = require('./config.js')

var connection = mongoose.connect(config.database, function(err){
    if(err){
        console.log('Error al conectar a la base de datos');
    } else {
        console.log('Conexion a la base de datos existosa');
    }
});