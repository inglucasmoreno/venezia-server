export class VentasProductosUpdateDTO {
    
    readonly venta: string;

    readonly producto: string;

    readonly descripcion: string;

    readonly unidad_medida: string;

    readonly cantidad: number;
    
    readonly precio: number;
    
    readonly creatorUser: string;
    
    readonly updatorUser: string;
    
    readonly activo: boolean;

}