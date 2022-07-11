import { IsNotEmpty } from "class-validator";

export class UnidadMedidaDTO {
  
  @IsNotEmpty()
  readonly descripcion: string;
  
  @IsNotEmpty()
  readonly creatorUser: string;
  
  @IsNotEmpty()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}