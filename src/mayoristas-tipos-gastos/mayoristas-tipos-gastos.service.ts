import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MayoristasTiposGastosUpdateDTO } from './dto/mayoristas-tipos-gastos-update.dto';
import { MayoristasTiposGastosDTO } from './dto/mayoristas-tipos-gastos.dto';
import { IMayoristasTiposGastos } from './interface/mayoristas-tipos-gastos.interface';

@Injectable()
export class MayoristasTiposGastosService {

  constructor(@InjectModel('TiposGastos') private readonly tiposGastosModel: Model<IMayoristasTiposGastos>) { }

  // Tipo por ID
  async getTipo(id: string): Promise<IMayoristasTiposGastos> {

    const tipoDB = await this.tiposGastosModel.findById(id);
    if (!tipoDB) throw new NotFoundException('El tipo no existe');

    const pipeline = [];

    // Tipo por ID
    const idTipo = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idTipo } })

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

    const tipo = await this.tiposGastosModel.aggregate(pipeline);

    return tipo[0];

  }

  // Listar tipos
  async listarTipos(querys: any): Promise<IMayoristasTiposGastos[]> {

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

    const tipos = await this.tiposGastosModel.aggregate(pipeline);

    return tipos;

  }

  // Crear tipo
  async crearTipo(tiposDTO: MayoristasTiposGastosDTO): Promise<IMayoristasTiposGastos> {

    // Verificacion: descripcion repetida
    const tipo = await this.tiposGastosModel.findOne({ descripcion: tiposDTO.descripcion.trim().toUpperCase() })
    if (tipo) throw new NotFoundException('El tipo ya se encuentra cargado');

    const nuevoTipo = new this.tiposGastosModel(tiposDTO);
    return await nuevoTipo.save();
  
  }

  // Actualizar tipo
  async actualizarTipo(id: string, tiposUpdateDTO: MayoristasTiposGastosUpdateDTO): Promise<IMayoristasTiposGastos> {

    const { descripcion } = tiposUpdateDTO;

    const tipoDB = await this.tiposGastosModel.findById(id);

    // Verificacion: descripcion repetida
    if (descripcion) {
      const tipoDescripcion = await this.tiposGastosModel.findOne({ descripcion: descripcion.trim().toUpperCase() })
      if (tipoDescripcion && tipoDescripcion._id.toString() !== id) throw new NotFoundException('El tipo ya se encuentra cargado');
    }

    const tipo = await this.tiposGastosModel.findByIdAndUpdate(id, tiposUpdateDTO, { new: true });
    return tipo;

  }

}
