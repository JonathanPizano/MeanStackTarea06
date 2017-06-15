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

module.exports = api;    
