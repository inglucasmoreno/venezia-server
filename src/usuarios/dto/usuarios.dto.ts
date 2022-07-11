import { IsNotEmpty } from "class-validator";

export class UsuarioDTO {
    
    @IsNotEmpty()
    readonly usuario: string;
    
    @IsNotEmpty()
    readonly dni: string;
    
    @IsNotEmpty()
    readonly apellido: string;
   
    @IsNotEmpty()
    readonly nombre: string;
    
    @IsNotEmpty()
    password: string;

    readonly email: string;
    
    readonly role: string;
    
    readonly permisos: []

    readonly activo: boolean;

}