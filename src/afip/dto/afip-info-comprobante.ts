import { IsNotEmpty } from "class-validator";

export class AfipInfoComprobanteDTO {

  @IsNotEmpty()
  readonly puntoVenta: number;

  @IsNotEmpty()
  readonly nroComprobante: number;

  @IsNotEmpty()
  readonly tipoComprobante: number;

}