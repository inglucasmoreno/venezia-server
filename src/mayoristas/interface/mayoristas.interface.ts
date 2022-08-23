import { Document } from 'mongoose';

export interface IMayoristas extends Document {
    readonly descripcion: string;
    password: string;
    readonly email: string;
    readonly telefono: string;
    readonly direccion: string;
    readonly role: string;
    readonly activo: boolean;
}