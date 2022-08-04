
import { Schema } from 'mongoose';

export const pedidosYaSchema = new Schema({
   
    monto: {
        type: Number,
        required: true,
    },

    comentario: {
      type: String,
      default: ''
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

},{ timestamps: true, collection: 'pedidosya' });
