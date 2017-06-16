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

////////////////////////////////////////////

function initDelete(req, res, next){
    if(!req.params.directorId){
        res.status(409).send({message: 'Por favor envía un Id de director'})
    } else {
        if(!mongoose.Types.ObjectId.isValid(req.params.directorId)){
            res.status(409).send({message: 'Id invalido'})
        } else {
            req.directorObj = {}
            req.directorObj.objAsync = {}
            // [0]Nuestro Director, [1] Las peliculas
            req.directorObj.arrayResult = []
            next()
        }
    }
}

function findPeliculas(req, res, next){
    //Buscamos los diretores por pais y las peliculas 
    req.directorObj.objAsync = Pelicula.find({director:req.params.directorId}).exec()
    .then((peliculas)=>{
        //Guardamos el pais
        req.directorObj.arrayResult[0] = req.params.directorId
        // Guardamos las peliculas encotnrados
        req.directorObj.arrayResult[1] = peliculas;
        // Inicializamos un arreglo de peliculas que se retornara
        // en la llamada asincrona
        /*var peliculas = []
        // Ahora buscamos las peliculas de los directores
        directores.forEach((director)=>{
            //Buscamos por director
            var promisePelicula = Pelicula.find({director:director}).exec()
            // Se introducen en el arreglo peliculas que se retornaran
            peliculas.push(promisePelicula)
        });
        //Hasta ahora nuestra llamada asincrona persiste y retorna un arreglo
        //de peliculas
        return Promise.all(peliculas)*/
    });
    next();
}

function deletePeliculas(req, res, next){
    // No tiene return el Promise anterior
    req.directorObj.objAsync = req.directorObj.objAsync.then(() => {
        //Borramos las peliculas
        if(typeof req.directorObj.arrayResult[1] != 'undefined'){
            var deletePeliculasArr = []; 
            //Borramos las peliculas de cada Director
            // Iteramos las peliculas
            req.directorObj.arrayResult[1].forEach((pelicula) => {
                var promisePelicula = Pelicula.findByIdAndRemove(pelicula._id).exec()
                deletePeliculasArr.push(promisePelicula);
            })
            Promise.all(deletePeliculasArr)
                .then((listDeletedPeliculas) => {
                    if(listDeletedPeliculas.length != 0){
                        console.log('Las siguientes peliculas han sido borrados' + listDeletedPeliculas);
                    }
                })
        } else {
            console.log('El pais' + req.params.directorId + 'no tiene peliculas asociadas');
        }
    });
    next();
}

function deleteDirector(req, res){
    req.directorObj.objAsync.then(
        () => {
            Director.findByIdAndRemove(req.params.directorId).exec()
                .then((removedDirector) => {
                    if(removedDirector) {
                        console.log('El siguiente director ha sido borrado: ' + removedDirector);
                        res.status(200).send({
                            removedDirector: removedDirector,
                            removedPeliculas: req.directorObj.arrayResult[1],
                        });
                    } else {
                        console.log('El director: ' + req.params.directorId + 'no existe en BD');
                        res.status(200).send({message: 'El director con identificador ' + req.params.directorId + 'no existe en BD'});
                    }
                }) 
        }
    )
    //Capturamos los errores en la petición
    .catch((err) => {
        res.status(500).send({message: 'Error en la petición'});
    })
}

//////////////////////////////////////////////

module.exports = {
    initPost,
    midPost,
    postDirector,
    initGetDirectores,
    getDirectores,
    initDelete,
    findPeliculas,
    deletePeliculas,
    deleteDirector
}