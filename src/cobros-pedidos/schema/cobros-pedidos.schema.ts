
import { Schema } from 'mongoose';

export const cobrosPedidosSchema = new Schema({

  mayorista: {
    type: Schema.Types.ObjectId,
    ref: 'mayoristas',
    required: true
  },

  cobro: {
    type: Schema.Types.ObjectId,
    ref: 'cobros_mayoristas',
    required: true
  },

  pedido: {
    type: Schema.Types.ObjectId,
    ref: 'ventas_mayoristas',
    required: true
  },

  paquete_cobro: {
    type: Schema.Types.ObjectId,
    ref: 'paquetes',
    required: true
  },

  paquete_pedido: {
    type: Schema.Types.ObjectId,
    ref: 'paquetes',
    required: true
  },

  cancelado: {
    type: Boolean,
    required: true
  },

  monto_total: {
    type: Number,
    required: true
  },

  monto_cobrado: {
    type: Number,
    required: true
  },

  monto_deuda: {
    type: Number,
    required: true
  },

  monto_cuenta_corriente: {
    type: Number,
    default: 0
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

}, { timestamps: true, collection: 'cobros_pedidos' });
