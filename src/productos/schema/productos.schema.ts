
import { Schema } from 'mongoose';

export const productosSchema = new Schema({
   
    descripcion: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },

    alicuota: {
      type: Number,
      default: null
    },

    precio: {
      type: Number,
      required: true,
    },

    precio_mayorista: {
      type: Number,
      default: ''
    },

    unidad_medida: {
      type: Schema.Types.ObjectId,
      ref: 'unidad_medida',
      required: true
    },

    balanza: {
      type: Boolean,
      required: true,
    },

    codigo: {
      type: String,
      trim: true,
      default: ''
    },

    cantidad: {
      type: Number,
      default: 0
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

},{ timestamps: true, collection: 'productos' });
