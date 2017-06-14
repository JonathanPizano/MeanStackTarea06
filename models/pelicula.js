'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PeliculaSchema = new Schema({
    numero: {
        type: String,
        trim: true,
        required: 'Inserta un numero por favor',
        index: {
            unique: false,
            dropDups: true
        }
    },
    nombre: {
        type: String,
        trim: true,
        required: 'Inserta un nombre por favor',
        index: {
            unique: false,
            dropDups: true
        }
    },
    duracion: {
        type: String,
        trim: true,
        required: 'Inserta una duracion por favor',
        index: {
            unique: false,
            dropDups: true
        }
    },
    director: {
        type: Schema.ObjectId,
        ref: 'Director',
        required: 'Inserta un id de Director por favor'
    }    
},
{
    timestamps: true
});

var Pelicula = mongoose.model('Pelicula', PeliculaSchema);
module.exports = Pelicula;