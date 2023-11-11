
import { Schema } from 'mongoose';

export const comprasSchema = new Schema({

  fecha_compra: {
    type: Date,
    default: new Date(),
    uppercase: true,
    trim: true
  },

  numero: {
    type: Number,
    required: true
  },

  numero_factura: {
    type: String,
    default: '',
    trim: true
  },

  comentarios: {
    type: String,
    uppercase: true,
    default: '',
    trim: true
  },

  estado: {
    type: String,
    default: 'Pendiente',
    trim: true
  },

  creatorUser: {
    type: Schema.Types.ObjectId,
    ref: 'usuario',
    required: true
  },

  updatorUser: {
    type: Schema.Types.ObjectId,
    ref: 'usuario',
    required: true
  },

  activo: {
    type: Boolean,
    required: true,
    default: true
  }

}, { timestamps: true, collection: 'compras' });
