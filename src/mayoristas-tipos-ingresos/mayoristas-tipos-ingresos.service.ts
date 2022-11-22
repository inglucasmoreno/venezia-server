import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MayoristasTiposIngresosUpdateDTO } from './dto/mayorista-tipos-ingresos-update.dto';
import { MayoristasTiposIngresosDTO } from './dto/mayorista-tipos-ingresos.dto';
import { IMayoristasTiposIngresos } from './interface/mayorista-tipos-ingresos.interface';

@Injectable()
export class MayoristasTiposIngresosService {



  constructor(@InjectModel('TiposIngresos') private readonly tiposIngresosModel: Model<IMayoristasTiposIngresos>) { }

  // Tipo por ID
  async getTipo(id: string): Promise<IMayoristasTiposIngresos> {

    const tipoDB = await this.tiposIngresosModel.findById(id);
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

    const tipo = await this.tiposIngresosModel.aggregate(pipeline);

    return tipo[0];

  }

  // Listar tipos
  async listarTipos(querys: any): Promise<IMayoristasTiposIngresos[]> {

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

    const tipos = await this.tiposIngresosModel.aggregate(pipeline);

    return tipos;

  }

  // Crear tipo
  async crearTipo(tiposDTO: MayoristasTiposIngresosDTO): Promise<IMayoristasTiposIngresos> {

    // Verificacion: descripcion repetida
    const tipo = await this.tiposIngresosModel.findOne({ descripcion: tiposDTO.descripcion.trim().toUpperCase() })
    if (tipo) throw new NotFoundException('El tipo ya se encuentra cargado');

    const nuevoTipo = new this.tiposIngresosModel(tiposDTO);
    return await nuevoTipo.save();

  }

  // Actualizar tipo
  async actualizarTipo(id: string, tiposUpdateDTO: MayoristasTiposIngresosUpdateDTO): Promise<IMayoristasTiposIngresos> {

    const { descripcion } = tiposUpdateDTO;
    
    // Verificacion: descripcion repetida
    if (descripcion) {
      const tipoDescripcion = await this.tiposIngresosModel.findOne({ descripcion: descripcion.trim().toUpperCase() })
      if (tipoDescripcion && tipoDescripcion._id.toString() !== id) throw new NotFoundException('El tipo ya se encuentra cargado');
    }

    const tipo = await this.tiposIngresosModel.findByIdAndUpdate(id, tiposUpdateDTO, { new: true });
    return tipo;

  }

}
