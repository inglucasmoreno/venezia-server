import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PaquetesDTO {

    @IsNotEmpty()
    readonly fecha_paquetes: string;
    
    @IsNumber()
    readonly numero: number;
 
    @IsNumber()
    readonly cantidad_pedidos: number;
    
    readonly estado: string;

    @IsString()
    readonly creatorUser: string;

    @IsString()
    readonly updatorUser: string;

    readonly activo: boolean;

}