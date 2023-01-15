import { Document } from 'mongoose';

export interface IVentasMayoristasProductos extends Document {
    readonly ventas_mayorista: string;
    readonly producto: string;
    readonly descripcion: string;
    readonly entregado: boolean;
    readonly precio: number;
    readonly precio_unitario: number;
    readonly unidad_medida: string;
    readonly unidad_medida_descripcion: string;
    readonly cantidad: number;
    readonly activo: boolean;
    readonly creatorUser: Date;
    readonly updatorUser: Date;
}