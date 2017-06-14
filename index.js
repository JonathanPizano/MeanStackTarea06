'use strict';

var app = require('./app');
var database = require('./database');

var puerto = process.env.PORT || 7070

app.listen(7070, function(){
    console.log("Servidor corriendo en puerto " + puerto);
});