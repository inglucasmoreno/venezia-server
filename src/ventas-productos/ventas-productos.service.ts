import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VentasProductosUpdateDTO } from './dto/ventas-productos-update.dto';
import { VentasProductosDTO } from './dto/ventas-productos.dto';
import { IVentasProductos } from './interface/ventas-productos.interface';

@Injectable()
export class VentasProductosService {

    constructor(@InjectModel('VentasProductos') private readonly ventasProductosModel: Model<IVentasProductos>){}
  
    // productos por ID
    async getVentasProducto(id: string): Promise<IVentasProductos> {
  
        const productosDB = await this.ventasProductosModel.findById(id);
        if(!productosDB) throw new NotFoundException('El producto no existe no existe');
  
        const pipeline = [];
  
        const idProducto = new Types.ObjectId(id);
        pipeline.push({ $match:{ _id: idProducto} }) 
    
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
  
        const producto = await this.ventasProductosModel.aggregate(pipeline);
        
        return producto[0];
  
    } 
  
    // Listar productos
    async listarProductos(querys: any): Promise<IVentasProductos[]> {
          
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
  
        const productos = await this.ventasProductosModel.aggregate(pipeline);
        
        return productos;
  
    }  
  
    // Crear producto
    async crearProducto(ventasProductosDTO: VentasProductosDTO): Promise<IVentasProductos> {
        const nuevoProducto = new this.ventasProductosModel(ventasProductosDTO);
        return await nuevoProducto.save();
    }
  
    // Actualizar producto
    async actualizarProducto(id: string, ventasProductosUpdateDTO: VentasProductosUpdateDTO): Promise<IVentasProductos> {
        const producto = await this.ventasProductosModel.findByIdAndUpdate(id, ventasProductosUpdateDTO, {new: true});
        return producto;
    }
  

}
