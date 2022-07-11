import { Document } from 'mongoose';

export interface IProducto extends Document {
    readonly descripcion: string;
    readonly precio: number;
    readonly unidad_medida: string;
    readonly balanza: boolean;
    readonly codigo: string;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}