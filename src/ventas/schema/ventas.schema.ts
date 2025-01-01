
import { Schema } from 'mongoose';

export const ventasSchema = new Schema({

  forma_pago: [
    {
      descripcion: {
        type: String,
        trim: true,
        required: true
      },
      valor: {
        type: Number,
        required: true
      }
    }
  ],

  precio_total: {
    type: Number,
    required: true
  },

  precio_total_limpio: {
    type: Number,
    required: true
  },

  adicional_credito: {
    type: Number,
    required: true
  },

  comprobante: {
    type: String,
    default: 'Normal'
  },

  pedidosya_comprobante: {
    type: String,
    uppercase: true,
    default: ''
  },

  total_balanza: {
    type: Number,
    required: true
  },

  total_no_balanza: {
    type: Number,
    required: true
  },

  facturacion: {
    puntoVenta: {
      type: Number,
      default: 0,
    },
    tipoComprobante: {
      type: Number,
      default: 0,
    },
    nroComprobante: {
      type: Number,
      default: 0,
    },
    clienteRazonSocial: {
      type: String,
      default: '',
    },
    clienteTipoPersona: {
      type: String,
      default: '',
    },
    clienteTipoIdentificacion: {
      type: String,
      default: 'CUIT',
    },
    clienteIdentificacion: {
      type: String,
      default: '',
    }
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

}, { timestamps: true, collection: 'ventas' });
