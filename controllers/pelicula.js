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
//////////////////////////////////

function initPutPel(req, res, next){
    if(Object.keys(req.body).length === 0) {
        res.status(409).send({message: 'Por favor envía un cuerpo'})
    } else {
        if(!req.params.peliculaId){
            res.status(409).send({message: 'Por favor envía un id de pais'})
        } else {
            req.peliculaFounded = {}
            req.directObj = {}
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
                        req.directObj = directorEncontrado
                        next()
                    }
                }
            });
        }
    }
}

function almostPutPel(req, res, next){
    //Verificar objetos req.directObj
    if(Object.keys(req.directObj).length === 0){
        // Ya se actualizo el objeto y esta guardado, se pasa a la siguiente funcion
        next()
    } else {
        // Una vez que ya se valido la existencia del director se puede actualizar la pelicula
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

///////////////////////////////

module.exports = {
    initPostPel,
    midPostPel,
    postPelicula,
    initGetPeliculas,
    getPeliculas,
    getPelicula,
    initPutPel,
    midPutPel,
    almostPutPel,
    putPelicula
}