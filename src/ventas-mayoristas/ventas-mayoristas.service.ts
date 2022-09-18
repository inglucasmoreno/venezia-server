import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IVentasMayoristasProductos } from 'src/ventas-mayoristas-productos/interface/ventas-mayoristas-productos.interface';
import { IVentasMayoristas } from './interface/ventas-mayoristas.interface';
import * as fs from 'fs';
import * as pdf from 'pdf-creator-node';
import { add, format } from 'date-fns';

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
            from: 'mayoristas',
            localField: 'creatorUser',
            foreignField: '_id',
            as: 'creatorUser'
        }}
      );

      pipeline.push({ $unwind: '$creatorUser' });

      // Informacion - Usuario actualizador
      pipeline.push({
        $lookup: { // Lookup
            from: 'mayoristas',
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
async listarVentas(querys: any): Promise<any> {
    
    const {
      columna, 
      direccion, 
      mayorista,
      desde,
      registerpp,
      estado,
      parametro
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({$match:{}});
    pipelineTotal.push({$match:{}});

    // Mayorista por ID
    if(mayorista && mayorista !== ''){
      const idMayorista = new Types.ObjectId(mayorista);
      pipeline.push({ $match:{ _id: idMayorista } })
      pipelineTotal.push({ $match:{ _id: idMayorista } }) 
    }

     // Activo / Inactivo
     if(estado && estado !== '') {
       pipeline.push({$match: { estado }});
       pipelineTotal.push({$match: { estado }});
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

    // Informacion - Repartidor
    pipelineTotal.push({
      $lookup: { // Lookup
          from: 'repartidores',
          localField: 'repartidor',
          foreignField: '_id',
          as: 'repartidor'
      }}
    );

    pipelineTotal.push({ $unwind: '$repartidor' });  

    // Informacion - Mayorista
    pipelineTotal.push({
      $lookup: { // Lookup
          from: 'mayoristas',
          localField: 'mayorista',
          foreignField: '_id',
          as: 'mayorista'
      }}
    );

    pipelineTotal.push({ $unwind: '$mayorista' }); 

    // Filtro por parametros
    if(parametro && parametro !== ''){
      const regex = new RegExp(parametro, 'i');
      pipeline.push({$match: { $or: [ { 'repartidor.descripcion': regex }, { 'mayorista.descripcion': regex }, { numero: Number(parametro) } ] }});
      pipelineTotal.push({$match: { $or: [ { 'repartidor.descripcion': regex }, { 'mayorista.descripcion': regex }, { numero: Number(parametro) } ] }});
    }

    // Paginacion
    pipeline.push({$skip: Number(desde)}, {$limit: Number(registerpp)});

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

    const [ventas, ventasTotal] = await Promise.all([
      this.ventasModel.aggregate(pipeline),
      this.ventasModel.aggregate(pipelineTotal)    
    ]);
    
    // Calculo de deuda
    let totalDeuda = 0;
    let totalIngresos = 0;
    ventasTotal.map(venta => {
      if(venta.estado === 'Deuda' ) totalDeuda += venta.deuda_monto;  
      totalIngresos += venta.monto_recibido;
    })

    return {
      ventas,
      totalItems: ventasTotal.length,
      totalDeuda,
      totalIngresos
    };

  }  

  // Crear ventas - pedido
  async crearVenta(data: any): Promise<any> {

    const { pedido, productos } = data;

    // Numero de pedido
    const ultimoPedido = await this.ventasModel.find().sort({createdAt: -1}).limit(1);

    let numero = 0;

    if(ultimoPedido.length === 0) numero = 1;
    else numero = ultimoPedido[0].numero + 1;
    
    const dataPedido = {...pedido, numero};

    // Se crea el pedido
    const nuevaVenta = new this.ventasModel(dataPedido);
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

  // Generar PDF - Detalles de pedido
  async generarDetallesPDF(id: string): Promise<any> {

    // Datos de pedido
    const pedido: any = await this.getVenta(id);

    // Productos del pedido

    const pipeline = [];
    pipeline.push({$match:{}});

    const idPedido = new Types.ObjectId(id);
    pipeline.push({ $match:{ ventas_mayorista: idPedido} }) 

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

    // Ordenando datos
    const ordenar: any = {};
    ordenar['descripcion'] = 1;
    pipeline.push({$sort: ordenar});

    const productos = await this.productosModel.aggregate(pipeline);

    let productosPedido: any[] = [];
    
    productos.map( producto => productosPedido.push({
      descripcion: producto.descripcion,
      precio_unitario: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.precio_unitario),
      precio: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.precio), 
      cantidad: producto.cantidad, 
      unidad_medida: producto.unidad_medida.descripcion
    }));

    let dataPDF = {
      fecha: format(new Date(), 'dd/MM/yyyy'),
      mayorista: pedido.mayorista.descripcion,
      telefono: pedido.mayorista.telefono,
      direccion: pedido.mayorista.direccion,
      numero_pedido: pedido.numero,
      total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pedido.precio_total),
      repartidor: pedido.repartidor._id == '333333333333333333333333' ? 'Sin especificar' : pedido.repartidor.descripcion,
      productos: productosPedido
    };

    let html: any;
    html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/detalles_pedido.html', 'utf-8');

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
      data: dataPDF,
      path: (process.env.PUBLIC_DIR || './public') + '/pdf/detalles_pedido.pdf'
    }

    // Generacion de PDF
    await pdf.create(document, options);

  }

}
