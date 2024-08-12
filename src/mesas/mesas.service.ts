import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMesas } from './interface/mesas.interface';
import * as mongoose  from 'mongoose';
import { MesasDTO } from './dto/mesas.dto';
import { MesasUpdateDTO } from './dto/mesas-update.dto';

@Injectable()
export class MesasService {

  constructor(
    @InjectModel('Mesas') private readonly mesasModel: Model<IMesas>,
  ) { }

  // Mesa por ID
  async getMesa(id: string): Promise<IMesas> {

    const mesaDB = await this.mesasModel.findById(id);
    if (!mesaDB) throw new NotFoundException('La mesa no existe');

    const pipeline = [];

    // Mesa por ID
    const idMesa = new mongoose.Types.ObjectId(id);
    pipeline.push({ $match: { _id: idMesa } })

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

    const mesa = await this.mesasModel.aggregate(pipeline);

    return mesa[0];

  }

  // Listar mesas
  async listarMesas(querys: any): Promise<IMesas[]> {

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

    const mesas = await this.mesasModel.aggregate(pipeline);

    return mesas;

  }

  // Crear mesa
  async crearMesa(mesasDTO: MesasDTO): Promise<IMesas> {

    // Verificacion: descripcion repetida
    const mesa = await this.mesasModel.findOne({ descripcion: mesasDTO.descripcion.trim().toUpperCase() })
    if (mesa) throw new NotFoundException('La mesa ya se encuentra cargada');

    const nuevaMesa = new this.mesasModel(mesasDTO);
    return await nuevaMesa.save();
  }

  // Actualizar mesa
  async actualizarMesa(id: string, mesasUpdateDTO: MesasUpdateDTO): Promise<IMesas> {

    const { descripcion } = mesasUpdateDTO;

    // Verificacion: descripcion repetida
    if (descripcion) {
      const mesaDescripcion = await this.mesasModel.findOne({ descripcion: descripcion.trim().toUpperCase() })
      if (mesaDescripcion && mesaDescripcion._id.toString() !== id) throw new NotFoundException('La mesa ya se encuentra cargada');
    }

    const mesa = await this.mesasModel.findByIdAndUpdate(id, mesasUpdateDTO, { new: true });
    return mesa;

  }

  // Eliminar mesa
  async eliminarMesa(id: string): Promise<String> {

    const mesa = await this.mesasModel.findByIdAndDelete(id);
    if (!mesa) throw new NotFoundException('La mesa no existe');

    return 'Mesa eliminada correctamente';

  }


}
