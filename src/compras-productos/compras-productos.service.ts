import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IComprasProductos } from './interface/compras-productos.interface';
import * as mongoose from 'mongoose';
import { ComprasProductosDTO } from './dto/compras-productos.dto';
import { ComprasProductosUpdateDTO } from './dto/compras-productos-update.dto';
import { IProducto } from 'src/productos/interface/productos.interface';

@Injectable()
export class ComprasProductosService {

  constructor(
    @InjectModel('ComprasProductos') private readonly comprasProductosModel: Model<IComprasProductos>,
    @InjectModel('Productos') private readonly productosModel: Model<IProducto>,
  ) { }

  // Compra-Producto por ID
  async getCompraProducto(id: string): Promise<IComprasProductos> {

    const compraProductoDB = await this.comprasProductosModel.findById(id);
    if (!compraProductoDB) throw new NotFoundException('La relacion no existe');

    const pipeline = [];

    // Compra-Producto por ID
    const idCompraProducto = new mongoose.Types.ObjectId(id);
    pipeline.push({ $match: { _id: idCompraProducto } })

    // Informacion de compra
    pipeline.push({
      $lookup: { // Lookup
        from: 'compras',
        localField: 'compra',
        foreignField: '_id',
        as: 'compra'
      }
    }
    );

    pipeline.push({ $unwind: '$compra' });

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

    // Informacion de unidad de medida
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

    const compraProducto = await this.comprasProductosModel.aggregate(pipeline);

    return compraProducto[0];

  }

  // Listar compras-productos
  async listarComprasProductos(querys: any): Promise<IComprasProductos[]> {

    const {
      columna,
      direccion,
      compra
    } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

    // Filtrar por compra
    if (compra) {
      const idCompra = new mongoose.Types.ObjectId(compra);
      pipeline.push({ $match: { compra: idCompra } })
    }

    // Informacion de compra
    pipeline.push({
      $lookup: { // Lookup
        from: 'compras',
        localField: 'compra',
        foreignField: '_id',
        as: 'compra'
      }
    }
    );

    pipeline.push({ $unwind: '$compra' });

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

    const comprasProductos = await this.comprasProductosModel.aggregate(pipeline);

    return comprasProductos;

  }

  // Crear compra-producto
  async crearCompraProducto(comprasProductosDTO: ComprasProductosDTO): Promise<IComprasProductos> {

    // Se incrementa el stock del producto
    const producto = await this.productosModel.findById(comprasProductosDTO.producto);
    if (!producto) throw new NotFoundException('El producto no existe');

    const cantidad = producto.cantidad + comprasProductosDTO.cantidad;
    const productoUpdateDTO = { cantidad };
    await this.productosModel.findByIdAndUpdate(comprasProductosDTO.producto, productoUpdateDTO, { new: true });

    // Crear compra-producto
    const nuevaCompraProducto = new this.comprasProductosModel(comprasProductosDTO);
    const productoDB = await nuevaCompraProducto.save();

    return this.getCompraProducto(productoDB._id);

  }

  // Crear multiples compra-producto
  async crearMultiCompraProducto(data: any): Promise<any> {

    // Datos de ingreso
    const { compra, productos } = data;

    // Recorrer el arreglo de productos, para crear la compra-producto e incrementar el stock del producto
    for (const producto of productos) {

      // Se incrementa el stock del producto
      const productoDB = await this.productosModel.findById(producto.producto);
      if (!productoDB) throw new NotFoundException('El producto no existe');

      // const cantidad = productoDB.cantidad + producto.cantidad;
      // const productoUpdateDTO = { cantidad };
      // await this.productosModel.findByIdAndUpdate(producto.producto, productoUpdateDTO, { new: true });

      // Crear compra-producto
      const compraProductoDTO = {
        compra,
        producto: producto.producto,
        cantidad: producto.cantidad,
        creatorUser: producto.creatorUser,
        updatorUser: producto.updatorUser
      };

      const nuevaCompraProducto = new this.comprasProductosModel(compraProductoDTO);
      await nuevaCompraProducto.save();

    }

    return 'Compra-producto creada correctamente';

  }

  // Actualizar compra-producto
  async actualizarCompraProducto(id: string, comprasProductosUpdateDTO: ComprasProductosUpdateDTO): Promise<IComprasProductos> {
    const compraProducto = await this.comprasProductosModel.findByIdAndUpdate(id, comprasProductosUpdateDTO, { new: true });
    return compraProducto;
  }

  // Eliminar compra-producto
  async eliminarCompraProducto(id: string): Promise<any> {

    const producto = await this.comprasProductosModel.findById(id);
    if (!producto) throw new NotFoundException('El producto no existe');

    await this.comprasProductosModel.findByIdAndDelete(id);
    return 'Producto eliminado correctamente';

  }


}
