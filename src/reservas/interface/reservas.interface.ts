import { Document } from 'mongoose';

export interface IReservas extends Document {
    readonly nro: number;
    readonly cliente: string;
    readonly adelanto: number;
    readonly precio_total: number;
    readonly fecha_entrega: string;
    readonly hora_entrega: string;
    readonly fecha_alerta: string;
    readonly fecha_reserva: string;
    readonly fecha_finalizacion: string;
    readonly horas_antes: string;
    readonly observaciones: string;
    readonly estado: string;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}