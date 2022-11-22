import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CobrosMayoristasUpdateDTO } from './dto/cobros-mayoristas-update.dto';
import { CobrosMayoristasDTO } from './dto/cobros-mayoristas.dto';
import { ICobrosMayoristas } from './interface/cobros-mayoristas.interface';

@Injectable()
export class CobrosMayoristasService {

  constructor(@InjectModel('CobrosMayoristas') private readonly cobrosModel: Model<ICobrosMayoristas>) { }

  // Cobro por ID
  async getCobro(id: string): Promise<ICobrosMayoristas> {

    const cobroDB = await this.cobrosModel.findById(id);
    if (!cobroDB) throw new NotFoundException('El cobro no existe');

    const pipeline = [];

    // Cobro por ID
    const idCobro = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idCobro } })

    // Informacion de mayorista
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'mayorista',
        foreignField: '_id',
        as: 'mayorista'
      }
    }
    );

    pipeline.push({ $unwind: '$mayorista' });

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

    const cobros = await this.cobrosModel.aggregate(pipeline);

    return cobros[0];

  }

  // Listar cobros
  async listarCobros(querys: any): Promise<ICobrosMayoristas[]> {

    const { columna, direccion } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

    // Informacion de mayorista
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'mayorista',
        foreignField: '_id',
        as: 'mayorista'
      }
    }
    );

    pipeline.push({ $unwind: '$mayorista' });

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

    const cobros = await this.cobrosModel.aggregate(pipeline);

    return cobros;

  }

  // Crear cobro
  async crearCobro(cobrosDTO: CobrosMayoristasDTO): Promise<ICobrosMayoristas> {
    const nuevoCobro = new this.cobrosModel(cobrosDTO);
    return await nuevoCobro.save();
  }

  // Actualizar cobro
  async actualizarCobro(id: string, cobrosUpdateDTO: CobrosMayoristasUpdateDTO): Promise<ICobrosMayoristas> {
    const cobro = await this.cobrosModel.findByIdAndUpdate(id, cobrosUpdateDTO, { new: true });
    return cobro;
  }

}
