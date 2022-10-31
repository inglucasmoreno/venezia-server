
import { Schema } from 'mongoose';

export const mayoristasGastosSchema = new Schema({

  tipo_gasto: {
    type: Schema.Types.ObjectId,
    ref: 'tipos_gastos',
    required: true
  },

  repartidor: {
    type: Schema.Types.ObjectId,
    ref: 'usuarios',
    required: true
  },

  monto: {
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

}, { timestamps: true, collection: 'mayoristas_gastos' });
