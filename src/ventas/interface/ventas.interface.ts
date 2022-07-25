import { Document } from 'mongoose';

export interface IVentas extends Document {
    readonly formaPago: [];
    readonly precio_total: number;
    readonly precio_total_limpio: number;
    readonly adicional_credito: number;
    readonly total_balanza: number;
    readonly total_no_balanza: number;
    readonly comprobante: string;
    readonly facturacion: {
        puntoVenta: number,
        tipoComprobante: number,
        nroComprobante: number
    };
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}