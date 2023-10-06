import { Document } from 'mongoose';

export interface IProducto extends Document {
    readonly descripcion: string;
    readonly alicuota: number;
    readonly precio: number;
    readonly precio_mayorista: number;
    readonly unidad_medida: string;
    readonly balanza: boolean;
    readonly codigo: string;
    readonly cantidad: number;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}