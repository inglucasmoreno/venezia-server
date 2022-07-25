import { IsNotEmpty } from "class-validator";

export class AfipUltimoNumeroComprobanteDTO {

  @IsNotEmpty()
  readonly puntoVenta: number;

  @IsNotEmpty()
  readonly tipoComprobante: number;

}