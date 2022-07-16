import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as XMLWriter from 'xml-writer';
import { Model, Types } from 'mongoose';
import { IVentasProductos } from 'src/ventas-productos/interface/ventas-productos.interface';
import { VentasUpdateDTO } from './dto/ventas-update.dto';
import { VentasDTO } from './dto/ventas.dto';
import { IVentas } from './interface/ventas.interface';

@Injectable()
export class VentasService {

  constructor(
    @InjectModel('Ventas') private readonly ventasModel: Model<IVentas>,
    @InjectModel('VentasProductos') private readonly ventasProductosModel: Model<IVentasProductos>,
  ){}
  
  // Venta por ID
  async getVentas(id: string): Promise<any> {

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

      const productos = await this.ventasProductosModel.find({venta: id});
      
      return {
        venta: venta[0],
        productos
      };

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

      // Se crea la venta
      const ventas = await this.ventasModel.aggregate(pipeline);
      
      return ventas;

  }  

  // Crear venta
  async crearVenta(ventasDTO: VentasDTO): Promise<IVentas> {
      
    const { productos } = ventasDTO;

    const productosTMP: any[] = productos;

    const nuevaVenta = new this.ventasModel(ventasDTO);
    const venta = await nuevaVenta.save();

    for(const producto of productosTMP){ producto.venta = venta._id; }

    // Se cargan los productos
    await this.ventasProductosModel.insertMany(productos);

    return venta;

  }

  // Actualizar venta
  async actualizarVenta(id: string, ventasUpdateDTO: VentasUpdateDTO): Promise<IVentas> {
      const venta = await this.ventasModel.findByIdAndUpdate(id, ventasUpdateDTO, {new: true});
      return venta;
  }

  // Facturacion
  async facturacion(): Promise<any> {
    
    let xml = new XMLWriter();

    xml.startDocument().startElement('personas');

    xml.startElement('persona');
    xml.writeElement('id', 1001);
    xml.writeElement('nombre', 'Moreno Lucas Omar');
    xml.writeElement('email','morenolucasomar@gmail.com');
    xml.endElement();

    xml.endElement();

    return xml;

  }

}
