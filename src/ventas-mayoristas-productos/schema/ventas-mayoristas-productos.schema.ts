
import { Schema } from 'mongoose';

export const ventasMayoristasProductosSchema = new Schema({

    paquete: {
        type: Schema.Types.ObjectId,
        ref: 'paquetes',
        required: true,
    },

    ventas_mayorista: {
        type: Schema.Types.ObjectId,
        ref: 'ventas_mayoristas',
        required: true,
    },

    producto: {
        type: Schema.Types.ObjectId,
        ref: 'productos',
        required: true,
    },

    descripcion: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    entregado: {
        type: Boolean,
        default: true
    },

    precio: {
        type: Number,
        required: true
    },

    precio_unitario: {
      type: Number,
      required: true
    },

    unidad_medida: {
        type: Schema.Types.ObjectId,
        ref: 'unidad_medida',
        trim: true
    },

    unidad_medida_descripcion: {
        type: String,
        required: true
    },

    cantidad: {
        type: Number,
        required: true
    },

    activo: {
        type: Boolean,
        required: true,
        default: true
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

},{ timestamps: true, collection: 'ventas_mayoristas_productos' });
