
import { Schema } from 'mongoose';

export const reservasSchema = new Schema({

  nro: {
    type: Number,
    required: true,
  },

  adelanto: {
    type: Number,
    required: true,
  },

  precio_total: {
    type: Number,
    required: true,
  },

  fecha_entrega: {
    type: Date,
    required: true
  },

  fecha_pedido: {
    type: Date,
    required: true
  },

  fecha_finalizacion: {
    type: Date,
    default: new Date()
  },

  estado: {
    type: String,
    default: 'Creada'
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

}, { timestamps: true, collection: 'reservas' });
