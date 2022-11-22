
import { Schema } from 'mongoose';

export const mayoristasTiposIngresosSchema = new Schema({
   
    descripcion: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        unique: true
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

},{ timestamps: true, collection: 'mayoristas_tipos_ingresos' });
