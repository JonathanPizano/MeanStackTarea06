'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-pagination');

var Pais = require('../models/pais');
var Director = require('../models/director');
var Pelicula = require('../models/pelicula');

function initPostPel(req, res, next){
    if(Object.keys(req.body).length ===0){
        res.status(409).send({message : 'Por favor envia un cuerpo'})
    } else {
        if(req.body.director){
            if(!mongoose.Types.ObjectId.isValid(req.body.director)){
                // Si no es valido mostramos un mensaje de Id invalido
                res.status(409).send({message: 'Id invalido de Director'});
            } else {
                req.directObj = {}
                next()
            }
        } else {
            res.status(409).send({message: 'No se ha proporcionado un id de director'})
        }
    }
}

function midPostPel(req, res, next){
    Director.findById(req.body.director, function(err, directorEncontrado){
        if(err){
            res.status(500).send({message: 'Error interno del servidor', err: err})
        } else {
            if(!directorEncontrado){
                res.status(404).send({
                    message: 'No se encuentra un director con el id proporcionado'
                })
            } else {
                req.directObj = directorEncontrado
                next()
            }
        }
    });
}

function postPelicula(req, res){
    if(Object.keys(req.body).length === 0){
        res.status(409).send({message: 'Por favor envia un cuerpo'})
    } else {
        var newPelicula = new Pelicula(req.body);

        newPelicula.save(function(err, peliculaSaved){
            if(err){
                res.status(409).send({message: 'Conflicto', err: err})
            } else {
                if(!peliculaSaved){
                    res.status(409).send({message: 'Pelicula no guardada'})
                } else {
                    res.status(200).send({pelicula: peliculaSaved})
                }
            }
        });
    }
}

function initGetPeliculas(req, res, next){
    if(!req.params.directorId){
        var peliculas = Pelicula.find({}).sort('nombre')
        req.peliculasObj = {}
        req.peliculasObj = peliculas
        next()
    } else {
        if(!mongoose.Types.ObjectId.isValid(req.params.directorId)){
            res.status(409).send({message: 'Id invalido de director'})
        } else {
            Director.findById(req.params.directorId, function(err, director){
                if(err){
                    res.status(500).send({message: 'Error interno del servidor', err: err})
                } else {
                    if(!director){
                        res.status(404).send({message:' No se encuentra un director con el id proporcionado'})
                    } else {
                        req.peliculasObj = null
                        next()
                    }
                }
            });
        }
    }
}

function getPeliculas(req,res){
    if(!req.peliculasObj){
        var peliculas = Pelicula.find({director:req.params.directorId}).sort('nombre')
    } else {
        var  peliculas = req.peliculasObj
    }
    peliculas.populate({path:'director'}).exec(function(err,peliculasFounded){
        if(err){
            res.status(500).send({message: 'Error interno del servidor', err: err})
        } else {
            if(!peliculasFounded){
                res.status(404).send({message: "No se encontraron peliculas"})
            } else {
                res.status(200).send({peliculas: peliculasFounded})
            }
        }
    });
}

function getPelicula(req, res){
    var peliculaId = req.params.id;
    var idValido = mongoose.Types.ObjectId.isValid(peliculaId);
    if(!idValido){
        res.status(409).send({message: 'Id invalido'})
    } else {
        Pelicula.findById(peliculaId, function(err, pelicula){
            if(err){
                console.log(err)
                res.status(509).send({message:'Error al obtener la pelicula', err: err})
            } else {
                res.status(200).send({pelicula})
            }
        });
    }
}

module.exports = {
    initPostPel,
    midPostPel,
    postPelicula,
    initGetPeliculas,
    getPeliculas,
    getPelicula
}