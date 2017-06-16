'use strict';

var express = require('express');

var DirectorController = require('../controllers/director');

var api = express.Router();

api.post('/director',
    DirectorController.initPost,
    DirectorController.midPost,
    DirectorController.postDirector
    );
api.get('/directores/:paisId?',
        DirectorController.initGetDirectores,
        DirectorController.getDirectores);
api.delete('/director/:directorId?',
    DirectorController.initDelete,
    DirectorController.findPeliculas,
    DirectorController.deletePeliculas,
    DirectorController.deleteDirector);

module.exports = api;