
import { Schema } from 'mongoose';

export const paquetesSchema = new Schema({
   
    fecha_paquetes: {
        type: Date,
        required: true,
    },

    numero: {
        type: Number,
        required: true,
    },

    cantidad_pedidos: {
        type: Number,
        unique: true,
        default: 0,
    },

    estado: {
        type: String,
        default: 'Pendiente'
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
