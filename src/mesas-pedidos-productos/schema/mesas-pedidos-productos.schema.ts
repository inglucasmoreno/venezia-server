
import { Schema } from 'mongoose';

export const mesasPedidosProductosSchema = new Schema({

    mesa: {
        type: Schema.Types.ObjectId,
        ref: 'mesas',
        required: true
    },

    pedido: {
        type: Schema.Types.ObjectId,
        ref: 'pedidos',
        required: true
    },

    producto: {
        type: Schema.Types.ObjectId,
        ref: 'productos',
        required: true,
    },

    alicuota: {
        type: Number,
        default: 21,
    },

    precio: {
        type: Number,
        required: true,
    },

    precioTotal: {
        type: Number,
        required: true,
    },

    cantidad: {
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

}, { timestamps: true, collection: 'mesas_pedidos_productos' });
