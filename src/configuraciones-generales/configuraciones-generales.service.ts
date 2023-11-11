import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IConfiguracionesGenerales } from './interface/configuraciones-generales.interface';
import { ConfiguracionesGeneralesDTO } from './dto/configuraciones-generales.dto';
import { ConfiguracionesGeneralesUpdateDTO } from './dto/configuraciones-generales-update.dto';

@Injectable()
export class ConfiguracionesGeneralesService {

  constructor(
    @InjectModel('ConfiguracionesGenerales') private readonly configuracionesGeneralesModel: Model<IConfiguracionesGenerales>,
  ) { }

  // Obtener configuracion
  async getConfiguraciones(): Promise<IConfiguracionesGenerales> {

    // Se obtienen la configuraciones
    const configuraciones = await this.configuracionesGeneralesModel.find();

    // Si las configuraciones no existen se inicializan
    if (configuraciones.length === 0) {
      const configuracionesGeneralesDTO = new this.configuracionesGeneralesModel();
      return await this.crearConfiguracion(configuracionesGeneralesDTO);
    }else{
      return configuraciones[0];
    }

  }

  // Listar configuraciones
  async listarConfiguraciones(querys: any): Promise<IConfiguracionesGenerales[]> {

    const { columna, direccion } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    const configuraciones = await this.configuracionesGeneralesModel.aggregate(pipeline);

    return configuraciones;

  }

  // Crear configuracion
  async crearConfiguracion(configuracionesGeneralesDTO: ConfiguracionesGeneralesDTO): Promise<IConfiguracionesGenerales> {
    const nuevaConfiguracion = new this.configuracionesGeneralesModel(configuracionesGeneralesDTO);
    return await nuevaConfiguracion.save();
  }

  // Actualizar configuracion
  async actualizarConfiguracion(configuracionesGeneralesUpdateDTO: ConfiguracionesGeneralesUpdateDTO): Promise<IConfiguracionesGenerales> {
    const configuracionesDB: any = await this.configuracionesGeneralesModel.find();
    if(configuracionesDB.length === 0) throw new NotFoundException('No se encontro la configuracion');
    const configuraciones = await this.configuracionesGeneralesModel.findByIdAndUpdate(configuracionesDB[0]._id, configuracionesGeneralesUpdateDTO, { new: true });
    return configuraciones;
  }


}
