import { IsNotEmpty } from "class-validator";

export class VentasProductosDTO {
    
    @IsNotEmpty()
    readonly venta: string;

    @IsNotEmpty()
    readonly producto: string;

    @IsNotEmpty()
    readonly descripcion: string;

    @IsNotEmpty()
    readonly unidad_medida: string;

    @IsNotEmpty()
    readonly cantidad: number;
    
    @IsNotEmpty()
    readonly precio: number;
    
    readonly creatorUser: string;
    
    readonly updatorUser: string;
    
    readonly activo: boolean;

}