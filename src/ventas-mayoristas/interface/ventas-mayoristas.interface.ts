import { Document } from 'mongoose';

export interface IVentasMayoristas extends Document {
    readonly mayorista: string;
    readonly precio_total: number;
    readonly facturacion: any;
    readonly comprobante: string;
    readonly activo: boolean;
}