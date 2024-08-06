import { IsNotEmpty } from "class-validator";

export class MesasPedidosDTO {
  
  @IsNotEmpty()
  readonly mesa: string;

  numero: number;
  
  readonly precioTotal: number;

  @IsNotEmpty()
  readonly creatorUser: string;
  
  @IsNotEmpty()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}