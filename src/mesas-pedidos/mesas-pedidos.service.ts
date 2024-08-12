import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMesasPedidos } from './interface/mesas-pedidos.interface';
import { IMesas } from 'src/mesas/interface/mesas.interface';
import * as mongoose from 'mongoose';
import { add, format } from 'date-fns';
import { MesasPedidosDTO } from './dto/mesas-pedidos.dto';
import { MesasPedidosUpdateDTO } from './dto/mesas-pedidos-update.dto';
import { IMesasPedidosProductos } from 'src/mesas-pedidos-productos/interface/mesas-pedidos-productos.interface';
import * as fs from 'fs';
import * as pdf from 'pdf-creator-node';

@Injectable()
export class MesasPedidosService {

  constructor(
    @InjectModel('MesasPedidos') private readonly mesasPedidosModel: Model<IMesasPedidos>,
    @InjectModel('MesasPedidosProductos') private readonly mesasPedidosProductosModel: Model<IMesasPedidosProductos>,
    @InjectModel('Mesas') private readonly mesasModel: Model<IMesas>,

  ) { }

  // Pedido por mesa
  async getPedidoPorMesa(idMesa: string): Promise<IMesasPedidos> {

    const pedidoDB = await this.mesasPedidosModel.findOne({ mesa: idMesa });
    if (!pedidoDB) throw new NotFoundException('El pedido no existe');

    const pipeline = [];

    // Pedido por ID
    const idMesaAd = new mongoose.Types.ObjectId(idMesa);
    pipeline.push({ $match: { mesa: idMesaAd } })

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

    const pedido = await this.mesasPedidosModel.aggregate(pipeline);

    return pedido[0];
    
  }

  // Pedido por ID
  async getPedido(id: string): Promise<IMesasPedidos> {

    const pedidoDB = await this.mesasPedidosModel.findById(id);
    if (!pedidoDB) throw new NotFoundException('El pedido no existe');

    const pipeline = [];

    // Pedido por ID
    const idPedido = new mongoose.Types.ObjectId(id);
    pipeline.push({ $match: { _id: idPedido } })

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

    const pedido = await this.mesasPedidosModel.aggregate(pipeline);

    return pedido[0];

  }

  // Listar pedidos
  async listarPedidos(querys: any): Promise<IMesasPedidos[]> {

    const { columna, direccion } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

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

    const pedidos = await this.mesasPedidosModel.aggregate(pipeline);

    return pedidos;

  }

  // Crear pedido
  async crearPedido(mesasPedidosDTO: any): Promise<IMesasPedidos> {

    const { productos, mesa } = mesasPedidosDTO;

    // Se crea el pedido
    const nuevoPedido = new this.mesasPedidosModel(mesasPedidosDTO);
    const nuevoPedidoDB = await nuevoPedido.save();

    // Se agregan los productos a pedido
    for (const elemento of productos) {
      const data = {
        mesa,
        pedido: nuevoPedidoDB._id,
        producto: elemento.producto,
        precio: elemento.precio,
        precioTotal: elemento.precioTotal,
        cantidad: elemento.cantidad,
        creatorUser: elemento.creatorUser,
        updatorUser: elemento.updatorUser,
      };

      const nuevoPedidoProducto = new this.mesasPedidosProductosModel(data);
      await nuevoPedidoProducto.save();
    }

    // Se actualizar la mesa y su estado se pasa a Ocupada
    const mesaDB: any = await this.mesasModel.findById(mesa);
    mesaDB.estado = 'Ocupada';
    await mesaDB.save();

    return nuevoPedidoDB;

  }

  // Actualizar pedido
  async actualizarPedido(id: string, mesasPedidosUpdateDTO: MesasPedidosUpdateDTO): Promise<IMesasPedidos> {
    const pedido = await this.mesasPedidosModel.findByIdAndUpdate(id, mesasPedidosUpdateDTO, { new: true });
    return pedido;
  }

  // Cancelar pedido de mesa
  async cancelarPedido(idMesa: string): Promise<any> {

    // Eliminar productos del pedido
    await this.mesasPedidosProductosModel.deleteMany({ mesa: idMesa });

    // Eliminar pedidos de la mesa
    await this.mesasPedidosModel.deleteMany({ mesa: idMesa });

    // Actualizar mesa a estado de libre
    const mesaDB: any = await this.mesasModel.findById(idMesa);
    mesaDB.estado = 'Libre';
    await mesaDB.save();

    return 'Pedido cancelado correctamente';

  }

  // Detalles de pedido
  async imprimirDetallesPedido(idMesa: string): Promise<any> {

    // Obtener pedido desde la mesa

    // const idMesaAd = new mongoose.Types.ObjectId(idMesa);
    // pipeline.push({ $match: { _id: idPedido } })

    const pedidoDB: any = await this.mesasPedidosModel.findOne({ mesa: idMesa });

    // Obtener datos de pedido
    const pipeline = [];

    // Se filtra por idMesa
    const idMesaAd = new mongoose.Types.ObjectId(idMesa);
    pipeline.push({ $match: { mesa: idMesaAd } });

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

    // Informacion de unidad de medida

    pipeline.push({
      $lookup: { // Lookup
        from: 'unidad_medida',
        localField: 'producto.unidad_medida',
        foreignField: '_id',
        as: 'producto.unidad_medida'
      }
    });

    pipeline.push({ $unwind: '$producto.unidad_medida' });

    // Se obtienen los productos
    const productos = await this.mesasPedidosProductosModel.aggregate(pipeline);

    // Preparacion de productos
    let productosPDF = [];
    productos.forEach((elemento: any) => {
      productosPDF.push({
        descripcion: elemento.producto.descripcion,
        unidad_medida: elemento.producto.unidad_medida.descripcion,
        cantidad: elemento.cantidad,
        precio_unitario: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(elemento.precio),
        precio: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(elemento.precioTotal),
      });
    })

    let dataPDF = {};
    let html: any;

    html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/cafeteria_detalles_pedido.html', 'utf-8');
    dataPDF = {
      fecha: format(pedidoDB.createdAt, 'dd/MM/yyyy kk:mm:ss'),
      total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pedidoDB.precioTotal),
      productos: productosPDF,
    };

    var options = {
      format: 'A4',
      orientation: 'portrait',
      border: '0mm',
      footer: {
        height: "0mm",
        contents: {}
      }
    }

    // Configuraciones de documento
    var document = {
      html: html,
      data: dataPDF,
      path: (process.env.PUBLIC_DIR || './public') + '/pdf/cafeteria_detalles_pedido.pdf'
    }

    // Generacion de PDF
    await pdf.create(document, options);

    return 'Detalles de pedido generado correctamente';

  }


}
