
import { Schema } from 'mongoose';

export const ventasReservasSchema = new Schema({
   
    venta: {
        type: Schema.Types.ObjectId,
        ref: 'ventas',
        required: true
    },

    reserva: {
      type: Schema.Types.ObjectId,
      ref: 'reservas',
      required: true
    },

    instancia: {
        type: String,
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

},{ timestamps: true, collection: 'ventas_reservas' });
