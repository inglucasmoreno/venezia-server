
import { Schema } from 'mongoose';

export const comprasProductosSchema = new Schema({

  compra: {
    type: Schema.Types.ObjectId,
    ref: 'compras',
    required: true
  },

  producto: {
    type: Schema.Types.ObjectId,
    ref: 'productos',
    required: true
  },

  cantidad: { 
    type: Number,
    required: true
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

}, { timestamps: true, collection: 'compras-productos' });
