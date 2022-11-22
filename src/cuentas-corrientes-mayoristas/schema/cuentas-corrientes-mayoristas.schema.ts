
import { Schema } from 'mongoose';

export const cuentasCorrientesMayoristasSchema = new Schema({
   
    mayorista: {
      type: Schema.Types.ObjectId,
      ref: 'mayoristas',
      required: true
    },

    saldo: {
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

},{ timestamps: true, collection: 'cuentas_corrientes_mayoristas' });
