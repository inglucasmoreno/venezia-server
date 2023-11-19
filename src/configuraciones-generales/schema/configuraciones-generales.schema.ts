
import { Schema } from 'mongoose';

export const configuracionesGeneralesSchema = new Schema({
   
    stock: {
        type: Boolean,
        default: false,
    },

    venta_cantidad: {
        type: Boolean,
        default: false,
    },

    venta_precio: {
        type: Boolean,
        default: true,
    },

    activo: {
        type: Boolean,
        default: true
    }

},{ timestamps: true, collection: 'configuraciones_generales' });
