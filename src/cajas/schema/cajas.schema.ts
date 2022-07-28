
import { Schema } from 'mongoose';

export const cajasSchema = new Schema({
   
    saldo_inicial: {
      type: Number,
      required: true,
    },

    saldo_proxima_caja: {
      type: Number,
      required: true,
    },

    total_ventas: {
      type: Number,
      required: true
    },

    total_facturado: {
      type: Number,
      required: true
    },

    total_balanza: {
      type: Number,
      required: true
    },

    total_no_balanza: {
      type: Number,
      required: true
    },

    otros_ingresos: {
      type: Number,
      required: true
    },

    otros_gastos: {
      type: Number,
      required: true
    },

    total_credito: {
      type: Number,
      required: true
    },

    total_mercadopago: {
      type: Number,
      required: true
    },

    total_efectivo: {
      type: Number,
      required: true
    },

    total_debito: {
      type: Number,
      required: true
    },

    total_adicional_credito: {
      type: Number,
      required: true
    },

    total_pedidosYa: {
      type: Number,
      required: true
    },

    diferencia: {
      type: Number,
      required: true
    },

    tesoreria: {
      type: Number,
      required: true
    },

    ingresos: [
      {
        descripcion: {
          type: String,
          required: true
        },
        monto: {
          type: Number,
          required: true
        },
      }
    ], 

    gastos: [
      {
        descripcion: {
          type: String,
          required: true
        },
        monto: {
          type: Number,
          required: true
        },
      }
    ],
    
    total_efectivo_en_caja: {
      type: Number,
      required: true
    },

    total_efectivo_en_caja_real: {
      type: Number,
      required: true
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

},{ timestamps: true, collection: 'cajas' });
