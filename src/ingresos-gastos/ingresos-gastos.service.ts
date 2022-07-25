import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IngresosGastosUpdateDTO } from './dto/ingresos-gastos-update.dto';
import { IngresosGastosDTO } from './dto/ingresos-gastos.dto';
import { IIngresosGastos } from './interface/ingresos-gastos.schema';

@Injectable()
export class IngresosGastosService {
   
  constructor(@InjectModel('IngresosGastos') private readonly ingresosGastosModel: Model<IIngresosGastos>,){}

  // IngresosGastos por ID
   async getIngresosGastos(id: string): Promise<IIngresosGastos> {

    const ingresosGastosDB = await this.ingresosGastosModel.findById(id);
    if(!ingresosGastosDB) throw new NotFoundException('El Ingreso o Gasto no existe');

    const pipeline = [];

    const idIngresoGasto = new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idIngresoGasto} }) 

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

    const ingresoGasto = await this.ingresosGastosModel.aggregate(pipeline);

    return ingresoGasto[0];

  } 

  // Listar ingresos/gastos
  async listarIngresosGastos(querys: any): Promise<any> {

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

  const ingresosGastos = await this.ingresosGastosModel.aggregate(pipeline);

  let ingresos: any[] = [];
  let gastos: any[] = [];
  let totalIngresos = 0;
  let totalGastos = 0;

  ingresosGastos.map( elemento => {
    if(elemento.tipo === 'gasto') {
      totalGastos += elemento.monto;
      gastos.push(elemento);
    }
    else {
      ingresos.push(elemento);
      totalIngresos += elemento.monto;
    }
  });

  return { 
    ingresos, 
    gastos,
    totalGastos,
    totalIngresos 
  };

  }  

  // Crear ingreso/gasto
  async crearIngresoGasto(ingresosGastosDTO: IngresosGastosDTO): Promise<IIngresosGastos> {
    const nuevoIngresoGasto = new this.ingresosGastosModel(ingresosGastosDTO);
    return await nuevoIngresoGasto.save();
  }

  // Actualizar ingreso/gasto
  async actualizarIngresoGasto(id: string, ingresosGastosUpdateDTO: IngresosGastosUpdateDTO): Promise<IIngresosGastos> {
    return await this.ingresosGastosModel.findByIdAndUpdate(id, ingresosGastosUpdateDTO, {new: true});
  }

  // Eliminar ingreso/gasto
  async eliminarIngresoGasto(id: string): Promise<IIngresosGastos> {
    return await this.ingresosGastosModel.findByIdAndRemove(id);
  }

}
