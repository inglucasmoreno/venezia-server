
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

    total_deuda: {
        type: Number,
        default: 0,
    },
    
    total_anticipo: {
        type: Number,
        default: 0,
    },

    total_parcial: {
        type: Number,
        default: 0,
    },

    total_gastos: {
        type: Number,
        default: 0,
    },

    total_ingresos: {
        type: Number,
        default: 0,
    },

    total_recibir: {
        type: Number,
        default: 0,
    },

    total_cobros: {
        type: Number,
        default: 0,
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
