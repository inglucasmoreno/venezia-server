
import { Schema } from 'mongoose';

export const ventasProductosSchema = new Schema({
   
    venta: {
        type: Schema.Types.ObjectId,
        ref: 'venta',
        required: true
    },

    producto: {
        type: Schema.Types.ObjectId,
        ref: 'producto',
        required: true
    },

    descripcion: {
        type: String,
        uppercase: true,
        required: true,
    },

    balanza: {
        type: Boolean,
        required: true,
      },

    unidad_medida: {
        type: String,
        uppercase: true,
        required: true,
    },

    cantidad: {
        type: Number,
        required: true,
    },

    precio: {
        type: Number,
        required: true,
    },

    precio_unitario: {
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

},{ timestamps: true, collection: 'ventas-productos' });
