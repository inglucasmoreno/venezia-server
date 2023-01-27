import { IsString } from 'class-validator';

export class PaquetesDTO {

    @IsString()
    fecha_paquete: string;
    
    readonly numero: number;
 
    @IsString()
    readonly repartidor: string;

    readonly cantidad_pedidos: number;

    readonly precio_total: number;

    readonly total_deuda: number;
    
    readonly total_anticipo: number;
    
    readonly total_parcial: number;
    
    readonly total_gastos: number;
    
    readonly total_ingresos: number;
    
    readonly total_recibir: number;

    readonly total_cobros: number;
    
    readonly estado: string;

    @IsString()
    readonly creatorUser: string;

    @IsString()
    readonly updatorUser: string;

    readonly activo: boolean;

}