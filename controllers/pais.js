'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-pagination');

var Pais = require('../models/pais');
var Director = require('../models/director');
var Pelicula = require('../models/pelicula');

function postPais(req,res){
    if(Object.keys(req.body).length === 0){
        res.status(409).send({message: 'Por favor envia un cuerpo'})
    } else {
        var newPais = new Pais(req.body);
        newPais.save(function(err, paisSaved){
            if(err){
                res.status(409).send({message: 'Conflicto', err:err })
            }else{
                if(!paisSaved){
                    res.status(409).send({message: 'Pais no guardado'})
                } else {
                    res.status(200).send({pais: paisSaved})
                }
            }
        });
    }
}

function getPais(req,res){
    //Verificamos que llegue el id
    if(!req.params.paisId){
        res.status(409).send({message: 'Por favor envía un id de pais'})
    } else {
        // Obtenemos el id que llega como parametro
        // Verificamos si el parametro enviado es un Object Id 
        if(!mongoose.Types.ObjectId.isValid(req.params.paisId)){
            //Si no es valido mostramos un mensaje de Id invalido
            res.status(409).send({message: 'Id invalido'})
        } else {
            Pais.findById(req.params.paisId,function(err, paisFounded){
                if(err){
                    res.status(500).send({message: 'Error interno del servidor', err: err})
                } else {
                    if(!paisFounded){
                        res.status(404).send({message: 'No se encontro el pais con el id proporcionado'})
                    } else {
                        res.status(200).send({pais: paisFounded})
                    }
                }
            });
        }
    }
}

function getPaises(req, res){
    Pais.find({}).sort("nombre").exec(function(err, paisesFounded){
        if(err){
            res.status(500).send({message: 'Error interno del servidor', err: err})
        } else {
            res.status(200).send({paises: paisesFounded})
        }
    })
}

/*
function putPais(req, res){
    if(Object.keys(req.body).length === 0){
        res.status(409).send({message: 'Por favor envia un cuerpo'})
    } else {
        if(!req.params.paisId){
            res.status(409).send({message: 'Por favor envia un id de pais'})
        } else {
            if(!mongoose.Types.ObjectId.isValid(req.params.paisId)){
                res.status(409).send({message: 'Id invalido'})
            } else {
                Pais.findByIdAndUpdate(req.params.paisId, req.body, function(err, paisUpdated ){
                    if(err){
                        res.status(409).send({message: 'Conflicto', err: err})
                    } else {
                        if(!paisUpdated){
                            res.status(404).send({message: 'No se encontro el pais con el id proporcionado'})
                        } else {
                            Pais.findById(req.params.paisId, function(err, paisFounded){
                                if(err){
                                    res.status(409).send({message: 'Conflicto', err: err})
                                } else {
                                    if(!paisFounded){
                                        res.status(409).send({message: 'Conflicto', err: err})
                                    } else {
                                        res.status(200).send({viejo: paisUpdated, nuevo:paisFounded})
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    }
}
*/

function initPut(req, res, next){
    if(Object.keys(req.body).length === 0) {
        res.status(409).send({message: 'Por favor envía un cuerpo'})
    } else {
        if(!req.params.paisId){
            res.status(409).send({message: 'Por favor envía un id de pais'})
        } else {
            req.paisFounded = {}
            next()
        }
    }
}

function midPut(req, res, next){
    Pais.findByIdAndUpdate(req.params.paisId, req.body, function(err, paisUpdated){
        if(err){
            res.status(409).send({ message: 'Conflicto', err: err})
        } else {
            if(!paisUpdated){
                res.status(404).send({ message: 'No se encontro el pais con el id proporcionado'})
            } else {
                req.paisesFounded = paisUpdated
                next()
            }
        }
    });
}

function putPais(req, res){
    Pais.findById(req.params.paisId, function(err, paisActualizado){
        if(err){
            res.status(500).send({message: 'Error interno del servidor', err: err})
        } else {
            res.status(200).send({viejo:req.paisesFounded, nuevo:paisActualizado})
        }
    });
}


function initDelete(req, res, next){
    if(!req.params.paisId){
        res.status(409).send({message: 'Por favor envía un Id de pais'})
    } else {
        if(!mongoose.Types.ObjectId.isValid(req.params.paisId)){
            res.status(409).send({message: 'Id invalido'})
        } else {
            req.paisObj = {}
            req.paisObj.objAsync = {}
            // [0]Nuestro pais, [1] Nuestros Directores, [2] Las peliculas
            req.paisObj.arrayResult = []
            next()
        }
    }
}

function findDirectoresYPeliculas(req, res, next){
    //Buscamos los diretores por pais y las peliculas 
    req.paisObj.objAsync = Director.find({pais:req.params.paisId}).exec()
    .then((directores)=>{
        //Guardamos el pais
        req.paisObj.arrayResult[0] = req.params.paisId
        // Guardamos los direct ores encotnrados
        req.paisObj.arrayResult[1] = directores;
        // Inicializamos un arreglo de peliculas que se retornara
        // en la llamada asincrona
        var peliculas = []
        // Ahora buscamos las peliculas de los directores
        directores.forEach((director)=>{
            //Buscamos por director
            var promisePelicula = Pelicula.find({director:director}).exec()
            // Se introducen en el arreglo peliculas que se retornaran
            peliculas.push(promisePelicula)
        });
        //Hasta ahora nuestra llamada asincrona persiste y retorna un arreglo
        //de peliculas
        return Promise.all(peliculas)
    });
    next();
}

function deletePeliculas(req, res, next){
    req.paisObj.objAsync = req.paisObj.objAsync
        .then((listaPeliculas)=>{
            //Guardamos las pelicuals encontradas
            req.paisObj.arrayResult[2] = listaPeliculas
            //Borramos las peliculas listadas
            if(typeof req.paisObj.arrayResult[2] != 'undefined'){
                var deletePeliculas = []
                //Borramos las peliculas de cada director del Pais
                req.paisObj.arrayResult[2].forEach((arrayPeliculas) => {
                    for(var i = 0; i < arrayPeliculas.length; i++ ){
                        var promisePelicula = Pelicula.findByIdAndRemove(arrayPeliculas[i]._id).exec()
                        deletePeliculas.push(promisePelicula);
                    }
            });
            //No tenemos un return
            Promise.all(deletePeliculas)
                .then((listDeletedPeliculas) => {
                    if(listDeletedPeliculas.length != 0){
                        console.log('Las siguientes peliculas han sido borradas: ' + listDeletedPeliculas);
                    }
                })
        } else {
            console.log('El pais' + req.params.paisId + 'no tiene peliculas asociadas');
        }
    })
    next()
}

function deleteDirectores(req, res, next){
    // No tiene return el Promise anterior
    req.paisObj.objAsync = req.paisObj.objAsync.then(() => {
        //Borramos los directores
        if(typeof req.paisObj.arrayResult[1] != 'undefined'){
            var deleteDirectoresArr = []; 
            //Borramos los directores de cada Pais
            // Iteramos los directores 
            req.paisObj.arrayResult[1].forEach((director) => {
                var promiseDirector = Director.findByIdAndRemove(director._id).exec()
                deleteDirectoresArr.push(promiseDirector);
            })
            Promise.all(deleteDirectoresArr)
                .then((listDeletedDirectores) => {
                    if(listDeletedDirectores.length != 0){
                        console.log('Los siguientes directores han sido borrados' + listDeletedDirectores);
                    }
                })
        } else {
            console.log('El pais' + req.params.paisId + 'no tiene directores asociados');
        }
    });
    next();
}

function deletePais(req, res){
    req.paisObj.objAsync.then(
        () => {
            Pais.findByIdAndRemove(req.params.paisId).exec()
                .then((removedPais) => {
                    if(removedPais) {
                        console.log('El siguiente pais ha sido borrado: ' + removedPais);
                        res.status(200).send({
                            removedPais: removedPais,
                            removedDirectors: req.paisObj.arrayResult[1],
                            removedMovies: req.paisObj.arrayResult[2]
                        });
                    } else {
                        console.log('El pais: ' + req.params.paisId + 'no existe en BD');
                        res.status(200).send({message: 'El pais con identificador ' + req.params.paisId + 'no existe en BD'});                        
                    }
                }) 
        }
    )
    //Capturamos los errores en la petición
    .catch((err) => {
        res.status(500).send({message: 'Error en la petición'});
    })
}

module.exports = {
    postPais,
    getPais,
    getPaises,
    putPais,
    initPut,
    midPut,
    initDelete,
    findDirectoresYPeliculas,
    deletePeliculas,
    deleteDirectores,
    deletePais
}