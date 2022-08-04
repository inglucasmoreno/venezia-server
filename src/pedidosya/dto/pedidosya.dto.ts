import { IsNotEmpty } from "class-validator";

export class PedidosYaDTO {
  
  @IsNotEmpty()
  readonly monto: number;

  readonly comentario: string;
  
  @IsNotEmpty()
  readonly creatorUser: string;
  
  @IsNotEmpty()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}