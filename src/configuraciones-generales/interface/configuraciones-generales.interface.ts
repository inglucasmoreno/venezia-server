import { Document } from 'mongoose';

export interface IConfiguracionesGenerales extends Document {
    readonly stock: boolean;
    readonly venta_cantidad: boolean;
    readonly venta_precio: boolean;
    readonly activo: boolean;
}