import { IsNotEmpty } from "class-validator";

export class VentasProductosDTO {
    
    @IsNotEmpty()
    readonly producto: string;

    @IsNotEmpty()
    readonly descripcion: string;
    
    @IsNotEmpty()
    readonly precio: number;
    
    readonly creatorUser: string;
    
    readonly updatorUser: string;
    
    readonly activo: boolean;

}