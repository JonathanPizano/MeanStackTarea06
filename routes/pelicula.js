'use strict';

var express = require('express');

var PeliculaController = require('../controllers/pelicula');

var api = express.Router();

api.post('/pelicula',
    PeliculaController.initPostPel,
    PeliculaController.midPostPel,
    PeliculaController.postPelicula
    );
api.get('/peliculas/:directorId?',
        PeliculaController.initGetPeliculas,
        PeliculaController.getPeliculas);
api.get('/pelicula/:id?', PeliculaController.getPelicula);
api.put('/pelicula/:peliculaId?',
    PeliculaController.initPutPel,
    PeliculaController.midPutPel,
    PeliculaController.almostPutPel,
    PeliculaController.putPelicula);
api.delete('/pelicula/:peliculaId?',
    PeliculaController.initDeletePel,
    PeliculaController.deletePais);


module.exports = api;