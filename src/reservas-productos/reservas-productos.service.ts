import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IReservasProductos } from './interface/reservas-productos.interface';

@Injectable()
export class ReservasProductosService {

  constructor(
    @InjectModel('ReservasProductos') private readonly reservasProductosModel: Model<IReservasProductos>,
  ) { }

  // Producto por ID
  async getProducto(id: string): Promise<IReservasProductos> {

    const productoDB = await this.reservasProductosModel.findById(id);
    if (!productoDB) throw new NotFoundException('El producto no existe');

    const pipeline = [];

    // Producto por ID
    const idProducto = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idProducto } })


    // Informacion de reserva
    pipeline.push({
      $lookup: { // Lookup
        from: 'reservas',
        localField: 'reserva',
        foreignField: '_id',
        as: 'reserva'
      }
    }
    );

    pipeline.push({ $unwind: '$reserva' });

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

    const producto = await this.reservasProductosModel.aggregate(pipeline);

    return producto[0];
  }

  // Crear producto
  async crearProducto(reservasProductosDTO: any): Promise<IReservasProductos> {

    // Creacion de producto
    const nuevoProducto = new this.reservasProductosModel(reservasProductosDTO);
    const producto = await nuevoProducto.save();

    return producto;

  }

  // Listar productos
  async listarProductos(querys: any): Promise<any> {

    const {
      columna,
      direccion,
      desde,
      registerpp,
      parametro,
      activo
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({ $match: {} });

    // Informacion de reserva
    pipeline.push({
      $lookup: { // Lookup
        from: 'reservas',
        localField: 'reserva',
        foreignField: '_id',
        as: 'reserva'
      }
    }
    );

    pipeline.push({ $unwind: '$reserva' });

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

    // Filtro - Activo / Inactivo
    let filtroActivo = {};
    if (activo && activo !== '') {
      filtroActivo = { activo: activo === 'true' ? true : false };
      pipeline.push({ $match: filtroActivo });
      pipelineTotal.push({ $match: filtroActivo });
    }

    // Filtro por parametros
    if (parametro && parametro !== '') {
      const regex = new RegExp(parametro, 'i');
      pipeline.push({ $match: { $or: [{ 'producto.descripcion': regex }] } });
      pipelineTotal.push({ $match: { $or: [{ 'producto.descripcion': regex }] } });
    }

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    // Paginacion
    pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

    const [productos, productosTotal] = await Promise.all([
      this.reservasProductosModel.aggregate(pipeline),
      this.reservasProductosModel.aggregate(pipelineTotal)
    ]);

    return {
      productos,
      totalItems: productosTotal.length
    };

  }

  // Actualizar producto
  async actualizarProducto(id: string, reservasProductosUpdateDTO: any): Promise<IReservasProductos> {

    // Se verifica si el producto a actualizar existe
    let productoDB = await this.getProducto(id);
    if (!productoDB) throw new NotFoundException('El producto no existe');

    const productoRes = await this.reservasProductosModel.findByIdAndUpdate(id, reservasProductosUpdateDTO, { new: true });
    return productoRes;

  }

  // Eliminar producto
  async eliminarProducto(id: string): Promise<any> {

    // Se verifica si el producto a eliminar existe
    let productoDB = await this.getProducto(id);
    if (!productoDB) throw new NotFoundException('El producto no existe');

    await this.reservasProductosModel.findByIdAndDelete(id);
    return 'Producto eliminado correctamente';

  }

}
