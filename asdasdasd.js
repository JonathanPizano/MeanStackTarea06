'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-pagination');

var Pais = require('../models/pais');
var Director = require('../models/director');
var Pelicula = require('../models/pelicula');

function initPutPel(req, res, next){
    if(Object.keys(req.body).length === 0) {
        res.status(409).send({message: 'Por favor envía un cuerpo'})
    } else {
        if(!req.params.peliculaId){
            res.status(409).send({message: 'Por favor envía un id de pais'})
        } else {
            req.peliculaFounded = {}
            next()
        }
    }
}

function midPutPel(req, res, next){
    if(!req.body.director){
        Pelicula.findByIdAndUpdate(req.params.peliculaId, req.body, function(err, peliculaUpdated){
            if(err){
                res.status(409).send({ message: 'Conflicto', err: err})
            } else {
                if(!peliculaUpdated){
                    res.status(404).send({ message: 'No se encontro la pelicula con el id proporcionado'})
                } else {
                    req.peliculaFounded = peliculaUpdated
                    next()
                }
            }
        });
    } else {
        // Buscar director id
        if(!mongoose.Types.ObjectId.isValid(req.body.director)){
            res.status(409).send({message: 'Id invalido de Director'});
        } else {
            Director.findById(req.body.director, function(err, directorEncontrado){
                if(err){
                    res.status(500).send({message: 'Error interno del servidor', err: err})
                } else {
                    if(!directorEncontrado){
                        res.status(404).send({
                            message: 'No se encuentra un director con el id proporcionado'
                        })
                    } else {
                        req.directObj = {}
                        req.directObj = directorEncontrado
                        next()
                    }
                }
            });
        }
    }
}

function almostPutPel(req, res, next){
    //Verificar objetos req.peliculaFounded || req.directObj
    if(Object.keys(req.directObj).length ===0){
        // Ya se actualizo el objeto y esta guardado, se pasa a la siguiente funcion
        next()
    } else {
        // Hay que actualizar con el id de director
        Pelicula.findByIdAndUpdate(req.params.peliculaId, req.body, function(err, peliculaUpdated){
            if(err){
                res.status(409).send({ message: 'Conflicto', err: err})
            } else {
                if(!peliculaUpdated){
                    res.status(404).send({ message: 'No se encontro la pelicula con el id proporcionado'})
                } else {
                    req.peliculaFounded = peliculaUpdated
                    next()
                }
            }
        });
    }
}

function putPelicula(req, res){
    Pelicula.findById(req.params.peliculaId, function(err, peliculaActualizada){
        if(err){
            res.status(500).send({message: 'Error interno del servidor', err: err})
        } else {
            res.status(200).send({viejo:req.peliculaFounded, nuevo:peliculaActualizada})
        }
    });
}
