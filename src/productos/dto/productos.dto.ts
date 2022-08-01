import { IsNotEmpty } from "class-validator";

export class ProductosDTO {
  
  @IsNotEmpty()
  readonly descripcion: string;

  @IsNotEmpty()
  readonly precio: number;

  @IsNotEmpty()
  readonly precio_mayorista: number;

  @IsNotEmpty()
  readonly unidad_medida: string;

  @IsNotEmpty()
  readonly balanza: boolean;

  readonly codigo: string;
  
  @IsNotEmpty()
  readonly creatorUser: string;
  
  @IsNotEmpty()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}