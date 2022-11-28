
import { Schema } from 'mongoose';

export const cajasMayoristasSchema = new Schema({
   
    fecha_caja: {
        type: Date,
        required: true,
    },

    cantidad_ventas: {
      type: Number,
      required: true,
    },

    total_ventas: {
      type: Number,
      required: true,
    },

    total_anticipos: {
      type: Number,
      required: true,
    },

    total_cuentas_corrientes: {
      type: Number,
      required: true,
    },
    
    total_deuda: {
      type: Number,
      required: true,
    },

    monto_a_recibir: {
      type: Number,
      required: true,
    },

    total_otros_ingresos: {
      type: Number,
      required: true,
    },

    total_otros_gastos: {
      type: Number,
      required: true,
    },

    ingresos: {
      type: Array,
      default: []
    },

    gastos: {
      type: Array,
      default: []
    },

    total_recibido: {
      type: Number,
      required: true,
    },

    total_recibido_real: {
      type: Number,
      required: true,
    },

    monto_cintia: {
      type: Number,
      required: true,
    },

    diferencia: {
      type: Number,
      required: true,
    },

    total_final: {
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

},{ timestamps: true, collection: 'cajas_mayoristas' });
