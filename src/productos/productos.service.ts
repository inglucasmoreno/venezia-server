import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose  from 'mongoose';
import { IProducto } from './interface/productos.interface';
import { ProductosDTO } from './dto/productos.dto';
import { ProductosUpdateDTO } from './dto/productos-update.dto';

@Injectable()
export class ProductosService {

  constructor(@InjectModel('Productos') private readonly productosModel: Model<IProducto>){}
  
  // Producto por ID
  async getProducto(id: string): Promise<IProducto> {

      const productoDB = await this.productosModel.findById(id);
      if(!productoDB) throw new NotFoundException('El producto no existe');

      const pipeline = [];

      const idProducto= new mongoose.Types.ObjectId(id);
      pipeline.push({ $match:{ _id: idProducto} }); 

      // Informacion de unidad_medida
      pipeline.push({
        $lookup: { // Lookup
            from: 'unidad_medida',
            localField: 'unidad_medida',
            foreignField: '_id',
            as: 'unidad_medida'
        }}
      );

      pipeline.push({ $unwind: '$unidad_medida' });

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

      const producto = await this.productosModel.aggregate(pipeline);
      
      return producto[0];

  } 

  // Buscar producto
  async getProductoParametro(query: any): Promise<IProducto> {

    let { codigo } = query;

    let productoDB = await this.productosModel.findOne({ codigo }); // Producto - No balanza

    if(!productoDB){ 
      codigo = codigo.slice(2,7);
      productoDB = await this.productosModel.findOne({ codigo });   // Producto - Balanza
      if(!productoDB) throw new NotFoundException('El producto no existe');
    }

    const pipeline = [];

    // Busqueda por codigo - No balanza

    if(codigo) pipeline.push({ $match:{  codigo } }); 
  
    // Informacion de unidad_medida
    pipeline.push({
      $lookup: { // Lookup
          from: 'unidad_medida',
          localField: 'unidad_medida',
          foreignField: '_id',
          as: 'unidad_medida'
      }}
    );

    pipeline.push({ $unwind: '$unidad_medida' });

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

    const producto = await this.productosModel.aggregate(pipeline);
    
    return producto[0];

  } 

  // Listar productos
  async listarProductos(querys: any): Promise<IProducto[]> {
        
      const {columna, direccion} = querys;

      const pipeline = [];
      pipeline.push({$match:{}});

      // Informacion de unidad_medida
      pipeline.push({
        $lookup: { // Lookup
            from: 'unidad_medida',
            localField: 'unidad_medida',
            foreignField: '_id',
            as: 'unidad_medida'
        }}
      );

      pipeline.push({ $unwind: '$unidad_medida' });
      
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

      const productos = await this.productosModel.aggregate(pipeline);
      
      return productos;

  }  

  // Crear producto
  async crearProducto(productoDTO: ProductosDTO): Promise<IProducto> {
      
    // Verificacion: descripcion repetida
    const productoDescripcion = await this.productosModel.findOne({descripcion: productoDTO.descripcion.trim().toUpperCase()})
    if(productoDescripcion) throw new NotFoundException('El producto ya se encuentra cargada');

    // Verificacion de codigo repetido
    if(productoDTO.codigo && productoDTO.codigo !== ''){
      const productoDB = await this.productosModel.findOne({codigo: productoDTO.codigo});
      if(productoDB) throw new NotFoundException('Ya existe un producto con ese código');
    }
    
    const producto = new this.productosModel(productoDTO);

    return await producto.save();
  
  }

  // Actualizar producto
  async actualizarProducto(id: string, productoUpdateDTO: ProductosUpdateDTO): Promise<IProducto> {
    
    const { descripcion } = productoUpdateDTO;

    // Verificacion: descripcion repetida
    if(descripcion){
      const productoDescripcion = await this.productosModel.findOne({descripcion: productoUpdateDTO.descripcion.trim().toUpperCase()})
      if(productoDescripcion && productoDescripcion._id.toString() !== id) throw new NotFoundException('El producto ya se encuentra cargada');
    }

    // Verificacion de codigo repetido
    if(productoUpdateDTO.codigo && productoUpdateDTO.codigo !== ''){
      const productoCodigo = await this.productosModel.findOne({codigo: productoUpdateDTO.codigo});
      if(productoCodigo && productoCodigo._id.toString() !== id) throw new NotFoundException('Ya existe un producto con ese código');
    }
    
    const producto = await this.productosModel.findByIdAndUpdate(id, productoUpdateDTO, {new: true});
  
    return producto;
  
  }

}
