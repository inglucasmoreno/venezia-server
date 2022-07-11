
import { Schema } from 'mongoose';

export const ventasSchema = new Schema({
   
    forma_pago: [
      {
        descripcion: {
          type: String,
          trim: true,
          required: true         
        },
        valor: {
          type: Number,
          required: true
        }
      }
    ],

    precio_total: {
      type: Number,
      required: true
    },

    afip: {
      type: Boolean,
      default: false
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

},{ timestamps: true, collection: 'ventas' });
