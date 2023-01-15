
export class PaquetesUpdateDTO {

    fecha_paquete: any;
    
    readonly numero: number;
 
    readonly repartidor: string;

    readonly cantidad_pedidos: number;
    
    readonly precio_total: number;

    readonly estado: string;

    readonly creatorUser: string;

    readonly updatorUser: string;

    readonly activo: boolean;

}