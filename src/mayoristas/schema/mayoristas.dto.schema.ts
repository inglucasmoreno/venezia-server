
import { Schema } from 'mongoose';

export const mayoristasSchema = new Schema({
   
    descripcion: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        trim: true
    },

    telefono: {
      type: String,
      required: true,
      trim: true
    },

    direccion: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },

    role: {
        type: String,
        default: 'ADMIN_ROLE',
        trim: true
    },

    confirm: {
        type: Boolean,
        default: false,
        trim: true
    },

    activo: {
        type: Boolean,
        required: true,
        default: true
    }

},{ timestamps: true, collection: 'mayoristas' });
