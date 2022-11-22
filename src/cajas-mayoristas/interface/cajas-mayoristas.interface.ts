import { Document } from 'mongoose';

export interface ICajasMayoristas extends Document {
    readonly fecha_caja: string;
    readonly total_ventas: number;
    readonly total_otros_ingresos: number;
    readonly total_otros_gastos: number;
    readonly total_deuda: number;
    readonly activo: boolean;
    readonly creatorUser: string; 
    readonly updatorUser: string;
}