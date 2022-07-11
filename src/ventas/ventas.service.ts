import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VentasUpdateDTO } from './dto/ventas-update.dto';
import { VentasDTO } from './dto/ventas.dto';
import { IVentas } from './interface/ventas.interface';

@Injectable()
export class VentasService {

  constructor(@InjectModel('Ventas') private readonly ventasModel: Model<IVentas>){}
  
  // Venta por ID
  async getVentas(id: string): Promise<IVentas> {

      const ventaDB = await this.ventasModel.findById(id);
      if(!ventaDB) throw new NotFoundException('La venta no existe');

      const pipeline = [];

      const idVenta = new Types.ObjectId(id);
      pipeline.push({ $match:{ _id: idVenta} }) 
  
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

      const venta = await this.ventasModel.aggregate(pipeline);
      
      return venta[0];

  } 

  // Listar ventas
  async listarVentas(querys: any): Promise<IVentas[]> {
        
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

      const ventas = await this.ventasModel.aggregate(pipeline);
      
      return ventas;

  }  

  // Crear venta
  async crearVenta(ventasDTO: VentasDTO): Promise<IVentas> {
      const nuevaVenta = new this.ventasModel(ventasDTO);
      return await nuevaVenta.save();
  }

  // Actualizar venta
  async actualizarVenta(id: string, ventasUpdateDTO: VentasUpdateDTO): Promise<IVentas> {
      const venta = await this.ventasModel.findByIdAndUpdate(id, ventasUpdateDTO, {new: true});
      return venta;
  }

}