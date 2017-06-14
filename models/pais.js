'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PaisSchema = new Schema({
    nombre: {
        type: String,
        trim: true,
        required: 'Inserta un nombre por favor',
        index: {
            unique: true,
            dropDups: true
        }
    }
},
{
    timestamps: true
});

var Pais = mongoose.model('Pais', PaisSchema);
module.exports = Pais;