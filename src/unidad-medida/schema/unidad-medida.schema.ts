
import { Schema } from 'mongoose';

export const unidadMedidaSchema = new Schema({
   
    descripcion: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
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

},{ timestamps: true, collection: 'unidad_medida' });
