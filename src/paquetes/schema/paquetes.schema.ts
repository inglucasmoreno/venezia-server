
import { Schema } from 'mongoose';

export const paquetesSchema = new Schema({
   
    fecha_paquete: {
        type: Date,
        required: true,
    },

    numero: {
        type: Number,
        unique: true,
        required: true,
    },

    repartidor: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        required: true
    },

    cantidad_pedidos: {
        type: Number,
        default: 0,
    },

    precio_total: {
        type: Number,
        default: 0,
    },

    estado: {
        type: String,
        default: 'Creando'
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

},{ timestamps: true, collection: 'paquetes' });
