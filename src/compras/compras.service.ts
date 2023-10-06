import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICompras } from './interface/compras.interface';
import * as mongoose  from 'mongoose';
import { ComprasDTO } from './dto/compras.dto';
import { ComprasUpdateDTO } from './dto/compras-update.dto';

@Injectable()
export class ComprasService {

  constructor(@InjectModel('Compras') private readonly comprasModel: Model<ICompras>,) { }

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
    const nuevaCompra = new this.comprasModel(comprasDTO);
    return await nuevaCompra.save();
  }

  // Actualizar compra
  async actualizarCompra(id: string, comprasUpdateDTO: ComprasUpdateDTO): Promise<ICompras> {
    const compra = await this.comprasModel.findByIdAndUpdate(id, comprasUpdateDTO, { new: true });
    return compra;
  }


}
