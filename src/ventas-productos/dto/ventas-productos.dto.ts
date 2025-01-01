import { IsNotEmpty } from "class-validator";

export class VentasProductosDTO {
    
    @IsNotEmpty()
    readonly venta: string;

    @IsNotEmpty()
    readonly producto: string;

    readonly alicuota: number;

    @IsNotEmpty()
    readonly descripcion: string;

    readonly balanza: boolean;

    @IsNotEmpty()
    readonly unidad_medida: string;

    @IsNotEmpty()
    readonly cantidad: number;
    
    @IsNotEmpty()
    readonly precio: number;

    @IsNotEmpty()
    readonly precio_unitario: number;
    
    readonly creatorUser: string;
    
    readonly updatorUser: string;
    
    readonly activo: boolean;

}