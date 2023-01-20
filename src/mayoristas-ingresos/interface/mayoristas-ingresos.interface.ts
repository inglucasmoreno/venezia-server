import { Document } from 'mongoose';

export interface IMayoristasIngresos extends Document {
    fecha_ingreso: any;
    readonly paquete: string;
    readonly tipo_ingreso: string;
    readonly repartidor: string;
    readonly monto: number;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}