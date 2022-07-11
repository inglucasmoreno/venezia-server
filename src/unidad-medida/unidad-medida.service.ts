import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUnidadMedida } from './interface/unidad-medida.interface';
import * as mongoose  from 'mongoose';
import { UnidadMedidaDTO } from './dto/unidad-medida.dto';
import { IProducto } from 'src/productos/interface/productos.interface';
import { UnidadMedidaUpdateDTO } from './dto/unidad-medida-update.dto';

@Injectable()
export class UnidadMedidaService {

  constructor(@InjectModel('UnidadMedida') private readonly unidadMedidaModel: Model<IUnidadMedida>,
              @InjectModel('Producto') private readonly productoModel: Model<IProducto>
  ){}
  
  // Unidad por ID
  async getUnidad(id: string): Promise<IUnidadMedida> {

      const unidadDB = await this.unidadMedidaModel.findById(id);
      if(!unidadDB) throw new NotFoundException('La unidad de medida no existe');

      const pipeline = [];

      // Unidad por ID
      const idUnidad = new mongoose.Types.ObjectId(id);
      pipeline.push({ $match:{ _id: idUnidad} }) 
  
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

      const unidad = await this.unidadMedidaModel.aggregate(pipeline);
      
      return unidad[0];

  } 

  // Listar unidades de medida
  async listarUnidades(querys: any): Promise<IUnidadMedida[]> {
        
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

      const unidades = await this.unidadMedidaModel.aggregate(pipeline);
      
      return unidades;

  }  

  // Crear unidad
  async crearUnidad(unidadMedidaDTO: UnidadMedidaDTO): Promise<IUnidadMedida> {

      // Verificacion: descripcion repetida
      const unidad = await this.unidadMedidaModel.findOne({descripcion: unidadMedidaDTO.descripcion.trim().toUpperCase()})
      if(unidad) throw new NotFoundException('La unidad ya se encuentra cargada');

      const nuevaUnidad = new this.unidadMedidaModel(unidadMedidaDTO);
      return await nuevaUnidad.save();
  }

  // Actualizar unidad
  async actualizarUnidad(id: string, unidadMedidaUpdateDTO: UnidadMedidaUpdateDTO): Promise<IUnidadMedida> {

      const unidadDB = await this.unidadMedidaModel.findById(id);
      
      // Verificacion: descripcion repetida
      const unidadDescripcion = await this.unidadMedidaModel.findOne({descripcion: unidadMedidaUpdateDTO.descripcion.trim().toUpperCase()})
      if(unidadDescripcion && unidadDescripcion._id.toString() !== id) throw new NotFoundException('La unidad ya se encuentra cargada');

      // Baja de unidad - Siempre y cuando no este asociada a un producto
      if(unidadDB.activo && !unidadMedidaUpdateDTO.activo){
        const producto = await this.productoModel.findOne({ unidad_medida: unidadDB._id });
        if(producto) throw new NotFoundException('Esta unidad de medida esta asociada a un producto');   
      }

      const unidad = await this.unidadMedidaModel.findByIdAndUpdate(id, unidadMedidaUpdateDTO, {new: true});
      return unidad;
      
  }
  
}
