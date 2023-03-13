
import { Schema } from 'mongoose';

export const reservasProductosSchema = new Schema({

  reserva: {
    type: Schema.Types.ObjectId,
    ref: 'reservas',
    required: true
  },

  descripcion: {
    type: String,
    required: true,
  },

  balanza: {
    type: Boolean,
    required: true,
  },

  unidad_medida: {
    type: String,
    required: true,
  },

  producto: {
    type: Schema.Types.ObjectId,
    ref: 'productos',
    required: true
  },

  precio: {
    type: Number,
    required: true,
  },

  precio_unitario: {
    type: Number,
    required: true,
  },

  cantidad: {
    type: Number,
    required: true,
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

}, { timestamps: true, collection: 'reservas-productos' });
