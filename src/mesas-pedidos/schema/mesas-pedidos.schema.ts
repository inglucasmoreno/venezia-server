
import { Schema } from 'mongoose';

export const mesasPedidosSchema = new Schema({
  
  mesa: {
    type: Schema.Types.ObjectId,
    ref: 'mesas',
    required: true
  },

  numero: {
    type: Number,
    unique: true,
    required: true,
  },

  precioTotal: {
    type: Number,
    default: 0,
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

}, { timestamps: true, collection: 'mesas_pedidos' });
