import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICompras } from './interface/compras.interface';
import * as mongoose  from 'mongoose';
import { ComprasDTO } from './dto/compras.dto';
import { ComprasUpdateDTO } from './dto/compras-update.dto';
import { add } from 'date-fns';
import { IComprasProductos } from 'src/compras-productos/interface/compras-productos.interface';
import { IProducto } from 'src/productos/interface/productos.interface';
import { get } from 'http';

@Injectable()
export class ComprasService {

  constructor(
    @InjectModel('Compras') private readonly comprasModel: Model<ICompras>,
    @InjectModel('ComprasProductos') private readonly comprasProductosModel: Model<IComprasProductos>,
    @InjectModel('Productos') private readonly productosModel: Model<IProducto>,
  ) { }

  // Compra por ID
  async getCompra(id: string): Promise<ICompras> {

    const compraDB = await this.comprasModel.findById(id);
    if (!compraDB) throw new NotFoundException('La compra no existe');

    const pipeline = [];

    // Compra por ID
    const idCompra = new mongoose.Types.ObjectId(id);
    pipeline.push({ $match: { _id: idCompra } })

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

    const compra = await this.comprasModel.aggregate(pipeline);

    return compra[0];

  }

  // Listar compras
  async listarCompras(querys: any): Promise<ICompras[]> {

    const { columna, direccion } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

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

    const compras = await this.comprasModel.aggregate(pipeline);

    return compras;

  }

  // Crear compra
  async crearCompra(comprasDTO: ComprasDTO): Promise<ICompras> {

    // Numero de compra
    const ultimaCompra: any = await this.comprasModel.findOne().sort({ createdAt: -1 }).limit(1);
    if (ultimaCompra) comprasDTO.numero = ultimaCompra.numero + 1;
    else comprasDTO.numero = 1;
    
    // Verificar si no existe otra compra con el mismo numero
    const existeCompra = await this.comprasModel.findOne({ numero: comprasDTO.numero });
    if (existeCompra) throw new NotFoundException('El numero de compra ya existe');

    comprasDTO.fecha_compra = add(new Date(comprasDTO.fecha_compra),{ hours: 3 });

    // Crear compra
    const nuevaCompra = new this.comprasModel(comprasDTO);
    return await nuevaCompra.save();

  }

  // Actualizar compra
  async actualizarCompra(id: string, comprasUpdateDTO: any): Promise<ICompras> {
    comprasUpdateDTO.fecha_compra = add(new Date(comprasUpdateDTO.fecha_compra),{ hours: 3 });
    const compra = await this.comprasModel.findByIdAndUpdate(id, comprasUpdateDTO, { new: true });
    return this.getCompra(compra._id);
  }

  // Completar compra
  async completarCompra(id: string): Promise<ICompras> {

    const compra = await this.comprasModel.findById(id);
    if (!compra) throw new NotFoundException('La compra no existe');

    // Impacto en stock de los productos asociados a la compra
    const productos = await this.comprasProductosModel.find({ compra: id });
    for (const producto of productos) {
      const productoDB = await this.productosModel.findById(producto.producto);
      const nuevaCantidad = productoDB.cantidad + producto.cantidad;
      await this.productosModel.findByIdAndUpdate(producto.producto, { cantidad: nuevaCantidad });
    }

    // Actalizando estado de la compra
    const comprasUpdateDTO = {
      estado: 'Completada',
    }

    await this.comprasModel.findByIdAndUpdate(id, comprasUpdateDTO, { new: true });
    return this.getCompra(id);

  }

}
