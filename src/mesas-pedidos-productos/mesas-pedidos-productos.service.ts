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
        @InjectModel('MesasPedidos') private readonly mesasPedidosModel: Model<IMesasPedidosProductos>,
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

        // Unidades de medida
        pipeline.push({
            $lookup: { // Lookup
                from: 'unidad_medida',
                localField: 'producto.unidad_medida',
                foreignField: '_id',
                as: 'producto.unidad_medida'
            }
        }
        );

        pipeline.push({ $unwind: '$producto.unidad_medida' });

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
        const nuevaRelacionDB = await nuevaRelacion.save();
        await this.actualizarPrecioPedido(mesasPedidosProductosDTO.mesa);
        return await this.getRelacion(nuevaRelacionDB._id);
    }

    // Actualizar relacion
    async actualizarRelacion(id: string, mesasPedidosProductosUpdateDTO: MesasPedidosProductosUpdateDTO): Promise<IMesasPedidosProductos> {
        
        const relacion = await this.mesasPedidosProductosModel.findByIdAndUpdate(id, mesasPedidosProductosUpdateDTO, { new: true });

        // Se actualizar el precio total del pedido
        await this.actualizarPrecioPedido(relacion.mesa);

        return relacion;

    }

    // Eliminar relacion
    async eliminarRelacion(id: string): Promise<any> {

        // Se elimina la relacion
        const relacion = await this.mesasPedidosProductosModel.findByIdAndDelete(id);

        // Se actualizar el precio total del pedido
        await this.actualizarPrecioPedido(relacion.mesa);

        return relacion;

    }

    // Actualizar precio de pedido
    async actualizarPrecioPedido(mesa: string): Promise<any> {

        let precioTotal = 0;
        const productos = await this.mesasPedidosProductosModel.find({ mesa });
        productos.forEach((relacion) => { precioTotal += relacion.precioTotal; });

        // Se actualiza el precio total del pedido
        const pedidoDB: any = await this.mesasPedidosModel.findOne({ mesa });
        pedidoDB.precioTotal = precioTotal;
        await pedidoDB.save();

        return pedidoDB;

    }

}
