import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IMesasPedidosProductos } from './interface/mesas-pedidos-productos.interface';
import { MesasPedidosProductosDTO } from './dto/mesas-pedidos-productos.dto';
import { MesasPedidosProductosUpdateDTO } from './dto/mesas-pedidos-productos-update.dto';

@Injectable()
export class MesasPedidosProductosService {

    constructor(
        @InjectModel('MesasPedidosProductos') private readonly mesasPedidosProductosModel: Model<IMesasPedidosProductos>,
    ) { }

    // MesaPedidoProducto por ID
    async getRelacion(id: string): Promise<IMesasPedidosProductos> {

        const relacionDB = await this.mesasPedidosProductosModel.findById(id);
        if (!relacionDB) throw new NotFoundException('La relacion no existe');

        const pipeline = [];

        // Relacion por ID
        const idRelacion = new mongoose.Types.ObjectId(id);
        pipeline.push({ $match: { _id: idRelacion } })        

        // Informacion de mesa
        pipeline.push({
            $lookup: { // Lookup
                from: 'mesas',
                localField: 'mesa',
                foreignField: '_id',
                as: 'mesa'
            }
        }
        );

        pipeline.push({ $unwind: '$mesa' });

        // Informacion de pedido
        pipeline.push({
            $lookup: { // Lookup
                from: 'mesas_pedidos',
                localField: 'pedido',
                foreignField: '_id',
                as: 'pedido'
            }
        }
        );

        pipeline.push({ $unwind: '$pedido' });

        // Informacion de producto
        pipeline.push({
            $lookup: { // Lookup
                from: 'productos',
                localField: 'producto',
                foreignField: '_id',
                as: 'producto'
            }
        }
        );

        pipeline.push({ $unwind: '$producto' });

        // Informacion de usuario creador
        pipeline.push({
            $lookup: { // Lookup
                from: 'usuarios',
                localField: 'creatorUser',
                foreignField: '_id',
                as: 'creatorUser'
            }
        }
        );

        pipeline.push({ $unwind: '$creatorUser' });

        // Informacion de usuario actualizador
        pipeline.push({
            $lookup: { // Lookup
                from: 'usuarios',
                localField: 'updatorUser',
                foreignField: '_id',
                as: 'updatorUser'
            }
        }
        );

        pipeline.push({ $unwind: '$updatorUser' });

        const relacion = await this.mesasPedidosProductosModel.aggregate(pipeline);

        return relacion[0];

    }

    // Listar relaciones
    async listarRelaciones(querys: any): Promise<IMesasPedidosProductos[]> {

        const { columna, direccion, mesa } = querys;

        const pipeline = [];
        pipeline.push({ $match: {} });

        // Filtro por mesa
        if (mesa) {
            const idMesa = new mongoose.Types.ObjectId(mesa);
            pipeline.push({ $match: { mesa: idMesa } });
        }

        // Informacion de mesa
        pipeline.push({
            $lookup: { // Lookup
                from: 'mesas',
                localField: 'mesa',
                foreignField: '_id',
                as: 'mesa'
            }
        }
        );

        pipeline.push({ $unwind: '$mesa' });

        // Informacion de pedido
        pipeline.push({
            $lookup: { // Lookup
                from: 'mesas_pedidos',
                localField: 'pedido',
                foreignField: '_id',
                as: 'pedido'
            }
        }
        );

        pipeline.push({ $unwind: '$pedido' });

        // Informacion de producto
        pipeline.push({
            $lookup: { // Lookup
                from: 'productos',
                localField: 'producto',
                foreignField: '_id',
                as: 'producto'
            }
        }
        );

        pipeline.push({ $unwind: '$producto' });

        // Informacion de usuario creador
        pipeline.push({
            $lookup: { // Lookup
                from: 'usuarios',
                localField: 'creatorUser',
                foreignField: '_id',
                as: 'creatorUser'
            }
        }
        );

        pipeline.push({ $unwind: '$creatorUser' });

        // Informacion de usuario actualizador
        pipeline.push({
            $lookup: { // Lookup
                from: 'usuarios',
                localField: 'updatorUser',
                foreignField: '_id',
                as: 'updatorUser'
            }
        }
        );

        pipeline.push({ $unwind: '$updatorUser' });

        // Ordenando datos
        const ordenar: any = {};
        if (columna) {
            ordenar[String(columna)] = Number(direccion);
            pipeline.push({ $sort: ordenar });
        }

        const relaciones = await this.mesasPedidosProductosModel.aggregate(pipeline);

        return relaciones;

    }

    // Crear relacion
    async crearRelacion(mesasPedidosProductosDTO: MesasPedidosProductosDTO): Promise<IMesasPedidosProductos> {
        const nuevaRelacion = new this.mesasPedidosProductosModel(mesasPedidosProductosDTO);
        return await nuevaRelacion.save();
    }

    // Actualizar relacion
    async actualizarRelacion(id: string, mesasPedidosProductosUpdateDTO: MesasPedidosProductosUpdateDTO): Promise<IMesasPedidosProductos> {
        const relacion = await this.mesasPedidosProductosModel.findByIdAndUpdate(id, mesasPedidosProductosUpdateDTO, { new: true });
        return relacion;
    }

}
