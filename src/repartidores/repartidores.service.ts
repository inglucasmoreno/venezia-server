import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRepartidores } from './interface/repartidores.interface';
import * as mongoose  from 'mongoose';
import { RepartidoresDTO } from './dto/repartidores.dto';
import { RepartidoresUpdateDTO } from './dto/repartidores-update.dto';

@Injectable()
export class RepartidoresService {

  constructor(@InjectModel('Repartidores') private readonly repartidoresModel: Model<IRepartidores>){}

  // Repartidores por ID
  async getRepartidor(id: string): Promise<IRepartidores> {

    const repartidorDB = await this.repartidoresModel.findById(id);
    if(!repartidorDB) throw new NotFoundException('El repartidor no existe');

    const pipeline = [];

    // Repartidor por ID
    const idRepartidor = new mongoose.Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idRepartidor} }) 

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }}
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
    $lookup: { // Lookup
    from: 'usuarios',
    localField: 'updatorUser',
    foreignField: '_id',
    as: 'updatorUser'
    }}
    );

    pipeline.push({ $unwind: '$updatorUser' });

    const repartidores = await this.repartidoresModel.aggregate(pipeline);

    return repartidores[0];

  } 

  // Listar repartidores
  async listarRepartidores(querys: any): Promise<IRepartidores[]> {

    const {columna, direccion} = querys;

    const pipeline = [];
    pipeline.push({$match:{}});

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }}
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }}
    );

    pipeline.push({ $unwind: '$updatorUser' });

    // Ordenando datos
    const ordenar: any = {};
    if(columna){
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({$sort: ordenar});
    }      

    const repartidores = await this.repartidoresModel.aggregate(pipeline);

    return repartidores.filter(repartidor => String(repartidor._id) !== '333333333333333333333333');

  }  

  // Crear repartidor
  async crearRepartidor(repartidoresDTO: RepartidoresDTO): Promise<IRepartidores> {

    // Verificacion: descripcion repetida
    const repartidor = await this.repartidoresModel.findOne({descripcion: repartidoresDTO.descripcion.trim().toUpperCase()})
    if(repartidor) throw new NotFoundException('El repartidor ya se encuentra cargado');

    const nuevoRepartidor = new this.repartidoresModel(repartidoresDTO);
    return await nuevoRepartidor.save();
  
  }

  // Actualizar repartidor
  async actualizarRepartidor(id: string, repartidoresUpdateDTO: RepartidoresUpdateDTO): Promise<IRepartidores> {

    const { descripcion } = repartidoresUpdateDTO;

    // Verificacion: descripcion repetida
    if(descripcion){
      const repartidorDescripcion = await this.repartidoresModel.findOne({descripcion: descripcion.trim().toUpperCase()})
      if(repartidorDescripcion && repartidorDescripcion._id.toString() !== id) throw new NotFoundException('El repartidor ya se encuentra cargado');
    }

    const repartidor = await this.repartidoresModel.findByIdAndUpdate(id, repartidoresUpdateDTO, {new: true});
    return repartidor;

  }

}
