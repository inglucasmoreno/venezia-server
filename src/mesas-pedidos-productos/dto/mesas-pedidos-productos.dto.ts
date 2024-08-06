import { IsNotEmpty } from "class-validator";

export class MesasPedidosProductosDTO {

    @IsNotEmpty()
    readonly mesa: string;
    
    @IsNotEmpty()
    readonly pedido: string;
    
    @IsNotEmpty()
    readonly producto: string;

    @IsNotEmpty()
    readonly cantidad: number;
    
    @IsNotEmpty()
    readonly precio: number;
    
    @IsNotEmpty()
    readonly precioTotal: number;
    
    @IsNotEmpty()
    readonly creatorUser: string;
    
    @IsNotEmpty()
    readonly updatorUser: string;
    
    readonly activo: boolean;

}