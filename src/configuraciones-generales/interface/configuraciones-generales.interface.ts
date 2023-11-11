import { Document } from 'mongoose';

export interface IConfiguracionesGenerales extends Document {
    readonly stock: boolean;
    readonly activo: boolean;
}