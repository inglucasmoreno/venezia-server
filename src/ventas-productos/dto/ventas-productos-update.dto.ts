export class VentasProductosUpdateDTO {
    
    readonly venta: string;

    readonly producto: string;

    readonly alicuota: number;

    readonly descripcion: string;

    readonly balanza: boolean;

    readonly unidad_medida: string;

    readonly cantidad: number;
    
    readonly precio: number;

    readonly precio_unitario: number;
    
    readonly creatorUser: string;
    
    readonly updatorUser: string;
    
    readonly activo: boolean;

}