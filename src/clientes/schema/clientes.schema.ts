
import { Schema } from 'mongoose';

export const clientesSchema = new Schema({

  descripcion: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },

  tipo_identificacion: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },

  identificacion: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },

  direccion: {
    type: String,
    uppercase: true,
    default: '',
    trim: true
  },

  telefono: {
    type: String,
    default: '',
    trim: true
  },

  email: {
    type: String,
    default: '',
    lowercase: true,
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

}, { timestamps: true, collection: 'clientes' });
