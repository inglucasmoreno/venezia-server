
import { Schema } from 'mongoose';

export const configuracionesGeneralesSchema = new Schema({
   
    stock: {
        type: Boolean,
        default: false,
    },

    activo: {
        type: Boolean,
        default: true
    }

},{ timestamps: true, collection: 'configuraciones_generales' });
