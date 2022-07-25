
import { Schema } from 'mongoose';

export const saldoInicialSchema = new Schema({
   
    monto: {
      type: Number,
      required: true,
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

},{ timestamps: true, collection: 'saldo_inicial' });
