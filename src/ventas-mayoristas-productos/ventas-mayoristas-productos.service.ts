import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VentasMayoristasProductosDTO } from './dto/ventas-mayoristas-productos.dto';
import { IVentasMayoristasProductos } from './interface/ventas-mayoristas-productos.interface';
import * as fs from 'fs';
import * as pdf from 'pdf-creator-node';
import { format } from 'date-fns';

@Injectable()
export class VentasMayoristasProductosService {

  constructor(@InjectModel('VentasMayoristasProductos') private readonly productosModel: Model<IVentasMayoristasProductos>){}
  
  // Producto por ID
  async getProducto(id: string): Promise<IVentasMayoristasProductos> {

      const productoDB = await this.productosModel.findById(id);
      if(!productoDB) throw new NotFoundException('El producto no existe');

      const pipeline = [];

      // Productos por ID
      const idProducto = new Types.ObjectId(id);
      pipeline.push({ $match:{ _id: idProducto } }) 

 // Informacion - Venta mayorista
    pipeline.push({
      $lookup: { // Lookup
          from: 'ventas_mayoristas',
          localField: 'ventas_mayorista',
          foreignField: '_id',
          as: 'ventas_mayorista'
      }}
    );

    pipeline.push({ $unwind: '$ventas_mayorista' });

    // Informacion - Producto
    pipeline.push({
      $lookup: { // Lookup
          from: 'productos',
          localField: 'producto',
          foreignField: '_id',
          as: 'producto'
      }}
    );

    pipeline.push({ $unwind: '$producto' });


    // Informacion - Unidad de medida
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


      const producto = await this.productosModel.aggregate(pipeline);
      
      return producto[0];

  } 

// Listar productos
async listarProductos(querys: any): Promise<IVentasMayoristasProductos[]> {
      
    const {columna, direccion, pedido, activo} = querys;

    const pipeline = [];
    pipeline.push({$match:{}});

    // Activo / Inactivo
    let filtroActivo = {};
    if(activo && activo !== '') {
      filtroActivo = { activo: activo === 'true' ? true : false };
      pipeline.push({$match: filtroActivo});
    }

    // Filtrado por pedido
    if(pedido && pedido !== ''){
      const idPedido = new Types.ObjectId(pedido);
      pipeline.push({ $match:{ ventas_mayorista: idPedido} }) 
    }

    // Informacion - Venta mayorista
    pipeline.push({
      $lookup: { // Lookup
          from: 'ventas_mayoristas',
          localField: 'ventas_mayorista',
          foreignField: '_id',
          as: 'ventas_mayorista'
      }}
    );

    pipeline.push({ $unwind: '$ventas_mayorista' });

    // Informacion - Producto
    pipeline.push({
      $lookup: { // Lookup
          from: 'productos',
          localField: 'producto',
          foreignField: '_id',
          as: 'producto'
      }}
    );

    pipeline.push({ $unwind: '$producto' });


    // Informacion - Unidad de medida
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

    const productos = await this.productosModel.aggregate(pipeline);

    return productos;

  }  

  // Crear productos
  async crearProducto(productoDTO: VentasMayoristasProductosDTO): Promise<IVentasMayoristasProductos> {
      const producto = new this.productosModel(productoDTO);
      const nuevoProducto = await producto.save();
      return await this.getProducto(String(nuevoProducto._id));
  }

  // Actualizar productos
  async actualizarProducto(id: string, productoUpdateDTO: any): Promise<IVentasMayoristasProductos> {
      const producto = await this.productosModel.findByIdAndUpdate(id, productoUpdateDTO, {new: true});
      return producto;
  }

  // Actualizar productos
  async eliminarProducto(id: string): Promise<IVentasMayoristasProductos> {
    const producto = await this.productosModel.findByIdAndDelete(id, {new: true});
    return producto;
  }
  
  // Generar PDF - Productos para elaboracion
  async generarProductosPDF(): Promise<any> {

    const productosPendientes = await this.listarProductos({
      columna: 'descripcion',
      direccion: 1,
      pedido: '',
      activo: 'true'
    });

    // Listado de productos pendientes

    let productoTMP = productosPendientes;
    let agregados = [];
    let productosPDF = [];
    
    productoTMP.map( (producto: any) => {
      if(!agregados.includes(String(producto.producto._id))){
        agregados.push(String(producto.producto._id));
        productosPDF.push({
          productoId: String(producto.producto._id,),
          descripcion: producto.producto.descripcion,
          unidad_medida: producto.unidad_medida.descripcion,
          cantidad:producto.cantidad
      })
      }else{
        productosPDF.map( elemento => {
          if(elemento.productoId === String(producto.producto._id)){
            elemento.cantidad += producto.cantidad; 
          }
        })
      }
    });  
    
    // Generacion de PDF

    let html: any;
    html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/productos_pendientes.html', 'utf-8');

    var options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
      footer: {
            height: "0mm",
            contents: {}
      }  
    } 

    // Configuraciones de documento
    var document = {
      html: html,
      data: {
        fecha: format(new Date(), 'dd/MM/yyyy'),
        productos: productosPDF,
      },
      path: (process.env.PUBLIC_DIR || './public') + '/pdf/productos_pendientes.pdf'
    }

    // Generacion de PDF
    await pdf.create(document, options);

    return 'PDF generado correctamente';

  }

}
