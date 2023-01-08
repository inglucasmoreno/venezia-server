import { IsString } from 'class-validator';

export class PaquetesDTO {

    @IsString()
    readonly fecha_paquete: string;
    
    readonly numero: number;
 
    @IsString()
    readonly repartidor: string;

    readonly cantidad_pedidos: number;

    readonly precio_total: number;
    
    readonly estado: string;

    @IsString()
    readonly creatorUser: string;

    @IsString()
    readonly updatorUser: string;

    readonly activo: boolean;

}