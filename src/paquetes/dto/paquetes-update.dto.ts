
export class PaquetesUpdateDTO {

    readonly fecha_paquete: string;
    
    readonly numero: number;
 
    readonly repartidor: string;

    readonly cantidad_pedidos: number;
    
    readonly precio_total: number;

    readonly estado: string;

    readonly creatorUser: string;

    readonly updatorUser: string;

    readonly activo: boolean;

}