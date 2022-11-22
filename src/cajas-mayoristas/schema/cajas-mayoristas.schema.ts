
import { Schema } from 'mongoose';

export const cajasMayoristasSchema = new Schema({
   
    fecha_caja: {
        type: Date,
        required: true,
    },

    total_ventas: {
      type: Number,
      required: true,
    },

    total_otros_ingresos: {
      type: Number,
      required: true,
    },

    total_otros_gastos: {
      type: Number,
      required: true,
    },

    total_deuda: {
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

},{ timestamps: true, collection: 'cajas_mayoristas' });
