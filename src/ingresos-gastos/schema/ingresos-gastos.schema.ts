
import { Schema } from 'mongoose';

export const ingresosGastosSchema = new Schema({
  
    descripcion: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    monto: {
      type: Number,
      required: true,
    },

    tipo: {
      type: String,
      trim: true,
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

},{ timestamps: true, collection: 'ingresos_gastos' });
