
import { Schema } from 'mongoose';

export const cobrosMayoristasSchema = new Schema({

  fecha_cobro: {
    type: Date,
    required: new Date()
  },

  nro: {
    type: Number,
    required: true
  },

  tipo: {
    type: String,
    required: true
  },

  mayorista: {
    type: Schema.Types.ObjectId,
    ref: 'mayoristas',
    required: true
  },

  repartidor: {
    type: Schema.Types.ObjectId,
    ref: 'usuarios',
    required: true
  },

  anticipo: {
    type: Number,
    required: true
  },

  monto: {
    type: Number,
    required: true
  },

  monto_total: {
    type: Number,
    required: true
  },

  ingreso: {
    type: Boolean,
    default: false
  },

  activo: {
    type: Boolean,
    required: true,
    default: true
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

}, { timestamps: true, collection: 'cobros_mayoristas' });
