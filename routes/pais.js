'use strict';

var express = require('express');
var PaisController = require('../controllers/pais')

var api = express.Router();

api.post('/pais', PaisController.postPais);
api.get('/pais/:paisId?', PaisController.getPais);
api.get('/paises', PaisController.getPaises);
api.put('/pais/:paisId?',
    PaisController.initPut,
    PaisController.midPut,
    PaisController.putPais);
api.delete('/pais/:paisId?',
    PaisController.initDelete,
    PaisController.findDirectoresYPeliculas,
    PaisController.deletePeliculas,
    PaisController.deleteDirectores,
    PaisController.deletePais);

module.exports = api;