import { IsNotEmpty } from "class-validator";

export class MayoristasDTO {
    
    @IsNotEmpty()
    readonly descripcion: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    readonly email: string;

    @IsNotEmpty()
    readonly telefono: string;

    @IsNotEmpty()
    readonly direccion: string;

    readonly role: string;
    
    readonly activo: boolean;

}