
import { Schema } from 'mongoose';

export const reservasSchema = new Schema({

  nro: {
    type: Number,
    required: true,
  },

  cliente: {
    type: Schema.Types.ObjectId,
    ref: 'clientes',
    required: true
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

  hora_entrega: {
    type: String,
    required: true
  },

  fecha_reserva: {
    type: Date,
    required: true
  },

  fecha_alerta: {
    type: Date,
    required: true
  },

  fecha_finalizacion: {
    type: Date,
    default: new Date()
  },

  horas_antes: {
    type: String,
    required: true,
  },

  observaciones: {
    type: String,
    default: ''
  },

  estado: {
    type: String,
    default: 'Pendiente'
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
