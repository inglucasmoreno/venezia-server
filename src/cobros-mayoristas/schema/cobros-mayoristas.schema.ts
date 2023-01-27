
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

  paquete: {
    type: Schema.Types.ObjectId,
    ref: 'paquetes',
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

  monto_anticipo: {
    type: Number,
    required: true
  },

  monto_total_recibido: {
    type: Number,
    required: true
  },

  monto_cancelar_deuda: {
    type: Number,
    required: true
  },

  deuda_total: {
    type: Number,
    required: true
  },

  deuda_restante: {
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
