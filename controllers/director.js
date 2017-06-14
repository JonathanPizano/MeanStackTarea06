'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-pagination');

var Pais = require('../models/pais');
var Director = require('../models/director');
var Pelicula = require('../models/pelicula');

function initPost(req, res, next){
    if(Object.keys(req.body).length ===0){
        res.status(409).send({message : 'Por favor envia un cuerpo'})
    } else {
        if(req.body.pais){
            if(!mongoose.Types.ObjectId.isValid(req.body.pais)){
                // Si no es valido mostramos un mensaje de Id invalido
                res.status(409).send({message: 'Id invalido de Pais'});
            } else {
                req.paisObj = {}
                next()
            }
        } else {
            res.status(409).send({message: 'No se ha proporcionado un id de pais'})
        }
    }
}

function midPost(req, res, next){
    Pais.findById(req.body.pais, function(err, paisEncontrado){
        if(err){
            res.status(500).send({message: 'Error interno del servidor', err: err})
        } else {
            if(!paisEncontrado){
                res.status(404).send({
                    message: 'No se encuentra un pais con el id proporcionado'
                })
            } else {
                req.paisObj = paisEncontrado
                next()
            }
        }
    });
}

function postDirector(req, res){
    if(Object.keys(req.body).length === 0){
        res.status(409).send({message: 'Por favor envia un cuerpo'})
    } else {
        var newDirector = new Director(req.body);

        newDirector.save(function(err, directorSaved){
            if(err){
                res.status(409).send({message: 'Conflicto', err: err})
            } else {
                if(!directorSaved){
                    res.status(409).send({message: 'Director no guardado'})
                } else {
                    res.status(200).send({director: directorSaved})
                }
            }
        });
    }
}

function initGetDirectores(req, res, next){
    if(!req.params.paisId){
        var directores = Director.find({}).sort('nombre')
        req.directoresObj = {}
        req.directoresObj = directores
        next()
    } else {
        if(!mongoose.Types.ObjectId.isValid(req.params.paisId)){
            res.status(409).send({message: 'Id invalido de Pais'})
        } else {
            Pais.findById(req.params.paisId, function(err, pais){
                if(err){
                    res.status(500).send({message: 'Error interno del servidor', err: err})
                } else {
                    if(!pais){
                        res.status(404).send({message:' No se encuentra un pais con el id proporcionado'})
                    } else {
                        req.directoresObj = null
                        next()
                    }
                }
            });
        }
    }
}

function getDirectores(req,res){
    if(!req.directoresObj){
        var directores = Director.find({pais:req.params.paisId}).sort('nombre')
    } else {
        var directores = req.directoresObj
    }
    directores.populate({path:'pais'}).exec(function(err,directoresFounded){
        if(err){
            res.status(500).send({message: 'Error interno del servidor', err: err})
        } else {
            if(!directoresFounded){
                res.status(404).send({message: "No se encontraron directores"})
            } else {
                res.status(200).send({directores: directoresFounded})
            }
        }
    });
}
module.exports = {
    initPost,
    midPost,
    postDirector,
    initGetDirectores,
    getDirectores
}