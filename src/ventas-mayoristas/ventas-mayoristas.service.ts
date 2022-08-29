import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IVentasMayoristasProductos } from 'src/ventas-mayoristas-productos/interface/ventas-mayoristas-productos.interface';
import { IVentasMayoristas } from './interface/ventas-mayoristas.interface';

@Injectable()
export class VentasMayoristasService {

  constructor(
    @InjectModel('VentasMayoristas') private readonly ventasModel: Model<IVentasMayoristas>,
    @InjectModel('VentasMayoristasProductos') private readonly productosModel: Model<IVentasMayoristasProductos>  
  ){}
  
  // Venta por ID
  async getVenta(id: string): Promise<IVentasMayoristas> {

      const ventaDB = await this.ventasModel.findById(id);
      if(!ventaDB) throw new NotFoundException('El venta no existe');

      const pipeline = [];

      // Venta por ID
      const idVenta = new Types.ObjectId(id);
      pipeline.push({ $match:{ _id: idVenta } }) 

      // Informacion - Repartidor
      pipeline.push({
        $lookup: { // Lookup
            from: 'repartidores',
            localField: 'repartidor',
            foreignField: '_id',
            as: 'repartidor'
        }}
      );

      pipeline.push({ $unwind: '$repartidor' });  

      // Informacion - Mayorista
      pipeline.push({
        $lookup: { // Lookup
            from: 'mayoristas',
            localField: 'mayorista',
            foreignField: '_id',
            as: 'mayorista'
        }}
      );

      pipeline.push({ $unwind: '$mayorista' });      

      // Informacion - Usuario creador
      pipeline.push({
        $lookup: { // Lookup
            from: 'usuarios',
            localField: 'creatorUser',
            foreignField: '_id',
            as: 'creatorUser'
        }}
      );

      pipeline.push({ $unwind: '$creatorUser' });

      // Informacion - Usuario actualizador
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
async listarVentas(querys: any): Promise<IVentasMayoristas[]> {
      
    const {columna, direccion, mayorista} = querys;

    const pipeline = [];
    pipeline.push({$match:{}});

    // Mayorista por ID
    if(mayorista && mayorista !== ''){
      const idMayorista = new Types.ObjectId(mayorista);
      pipeline.push({ $match:{ _id: idMayorista } }) 
    }

    // Informacion - Repartidor
    pipeline.push({
      $lookup: { // Lookup
          from: 'repartidores',
          localField: 'repartidor',
          foreignField: '_id',
          as: 'repartidor'
      }}
    );

    pipeline.push({ $unwind: '$repartidor' });  

    // Informacion - Mayorista
    pipeline.push({
      $lookup: { // Lookup
          from: 'mayoristas',
          localField: 'mayorista',
          foreignField: '_id',
          as: 'mayorista'
      }}
    );

    pipeline.push({ $unwind: '$mayorista' });      

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
          from: 'mayoristas',
          localField: 'creatorUser',
          foreignField: '_id',
          as: 'creatorUser'
      }}
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas',
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

  // Crear ventas - pedido
  async crearVenta(data: any): Promise<any> {

      const { pedido, productos } = data;

      // Se crea el pedido
      const nuevaVenta = new this.ventasModel(pedido);
      const pedidoDB = await nuevaVenta.save();
      
      // Carga de productos
      const productosTMP: any[] = productos;
      for(const producto of productosTMP){ producto.ventas_mayorista = pedidoDB._id; }

      await this.productosModel.insertMany(productos);

      return 'Pedido generado correctamente';
    
  }

  // Actualizar venta
  async actualizarVenta(id: string, ventaUpdateDTO: any): Promise<IVentasMayoristas> {

      const { activo } = ventaUpdateDTO;

      // Se finalizan los productos de la venta
      if(!activo) {
        await this.productosModel.updateMany({ventas_mayorista: id}, { activo: false } );
      };
      
      // Se actualiza la venta
      const venta = await this.ventasModel.findByIdAndUpdate(id, ventaUpdateDTO, {new: true});
      
      return venta;

  }

}
