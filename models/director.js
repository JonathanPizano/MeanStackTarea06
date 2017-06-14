'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DirectorSchema = new Schema({
    nombre: {
        type: String,
        trim: true,
        required: 'Inserta un nombre por favor',
        index: {
            unique: false,
            dropDups: true
        }
    },
    apellidoP: {
        type: String,
        trim: true,
        required: 'Inserta un apellido paterno por favor',
        index: {
            unique: false,
            dropDups: true
        }
    },
    descripcion: {
        type: String,
        trim: true,
        required: 'Inserta una descripcion por favor',
        index: {
            unique: false,
            dropDups: true
        }
    },
    pais: {
        type: Schema.ObjectId,
        ref: 'Pais',
        required: 'Inserta un id de Pais por favor'
    }    
},
{
    timestamps: true
});

var Director = mongoose.model('Director', DirectorSchema);
module.exports = Director;