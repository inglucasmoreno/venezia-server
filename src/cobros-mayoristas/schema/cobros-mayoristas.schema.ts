
import { Schema } from 'mongoose';

export const cobrosMayoristasSchema = new Schema({

  nro: {
    type: Number,
    required: true
  },

  mayorista: {
    type: Schema.Types.ObjectId,
    ref: 'mayoristas',
    required: true
  },

  monto: {
    type: Number,
    required: true
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
