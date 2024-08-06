import { IsNotEmpty } from "class-validator";

export class MesasDTO {
  
  @IsNotEmpty()
  readonly descripcion: string;

  readonly estado: string;
  
  @IsNotEmpty()
  readonly creatorUser: string;
  
  @IsNotEmpty()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}