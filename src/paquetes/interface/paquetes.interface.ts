import { Document } from 'mongoose';

export interface IPaquetes extends Document {
    readonly fecha_paquetes: string;
    readonly numero: number;
    readonly cantidad_pedidos: number;
    readonly estado: string;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}