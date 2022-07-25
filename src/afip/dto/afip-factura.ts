import { IsNotEmpty } from "class-validator";

export class AfipFacturaDTO {

  readonly ptoVta: number;

  @IsNotEmpty()
  readonly cbteTipo: number;

  readonly docTipo: number;

  readonly docNro: number;

  @IsNotEmpty()
  readonly cbteNro: number;

  @IsNotEmpty()
  readonly impTotal: number;

}