import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VentasMayoristasProductosDTO } from './dto/ventas-mayoristas-productos.dto';
import { IVentasMayoristasProductos } from './interface/ventas-mayoristas-productos.interface';
import * as fs from 'fs';
import * as pdf from 'pdf-creator-node';
import { format } from 'date-fns';
import { IUsuario } from 'src/usuarios/interface/usuarios.interface';
import { IVentasMayoristas } from 'src/ventas-mayoristas/interface/ventas-mayoristas.interface';
import { IPaquetes } from 'src/paquetes/interface/paquetes.interface';

@Injectable()
export class VentasMayoristasProductosService {

  constructor(
    @InjectModel('Paquetes') private readonly paquetesModel: Model<IPaquetes>,
    @InjectModel('VentasMayoristas') private readonly ventasModel: Model<IVentasMayoristas>,
    @InjectModel('VentasMayoristasProductos') private readonly productosModel: Model<IVentasMayoristasProductos>,
    @InjectModel('Usuarios') private readonly usuariosModel: Model<IUsuario>,
  ) { }

  // Producto por ID
  async getProducto(id: string): Promise<IVentasMayoristasProductos> {

    const productoDB = await this.productosModel.findById(id);
    if (!productoDB) throw new NotFoundException('El producto no existe');

    const pipeline = [];

    // Productos por ID
    const idProducto = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idProducto } })

    // Informacion - Venta mayorista
    pipeline.push({
      $lookup: { // Lookup
        from: 'ventas_mayoristas',
        localField: 'ventas_mayorista',
        foreignField: '_id',
        as: 'ventas_mayorista'
      }
    }
    );

    pipeline.push({ $unwind: '$ventas_mayorista' });

    // Informacion - Producto
    pipeline.push({
      $lookup: { // Lookup
        from: 'productos',
        localField: 'producto',
        foreignField: '_id',
        as: 'producto'
      }
    }
    );

    pipeline.push({ $unwind: '$producto' });


    // Informacion - Unidad de medida
    pipeline.push({
      $lookup: { // Lookup
        from: 'unidad_medida',
        localField: 'unidad_medida',
        foreignField: '_id',
        as: 'unidad_medida'
      }
    }
    );

    pipeline.push({ $unwind: '$unidad_medida' });


    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$updatorUser' });


    const producto = await this.productosModel.aggregate(pipeline);

    return producto[0];

  }

  // Listar productos
  async listarProductos(querys: any): Promise<IVentasMayoristasProductos[]> {

    const { columna, direccion, pedido, activo } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

    // Activo / Inactivo
    let filtroActivo = {};
    if (activo && activo !== '') {
      filtroActivo = { activo: activo === 'true' ? true : false };
      pipeline.push({ $match: filtroActivo });
    }

    // Filtrado por pedido
    if (pedido && pedido !== '') {
      const idPedido = new Types.ObjectId(pedido);
      pipeline.push({ $match: { ventas_mayorista: idPedido } })
    }

    // Informacion - Venta mayorista
    pipeline.push({
      $lookup: { // Lookup
        from: 'ventas_mayoristas',
        localField: 'ventas_mayorista',
        foreignField: '_id',
        as: 'ventas_mayorista'
      }
    }
    );

    pipeline.push({ $unwind: '$ventas_mayorista' });

    // Informacion - Producto
    pipeline.push({
      $lookup: { // Lookup
        from: 'productos',
        localField: 'producto',
        foreignField: '_id',
        as: 'producto'
      }
    }
    );

    pipeline.push({ $unwind: '$producto' });


    // Informacion - Unidad de medida
    pipeline.push({
      $lookup: { // Lookup
        from: 'unidad_medida',
        localField: 'unidad_medida',
        foreignField: '_id',
        as: 'unidad_medida'
      }
    }
    );

    pipeline.push({ $unwind: '$unidad_medida' });


    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$updatorUser' });

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    const productos = await this.productosModel.aggregate(pipeline);

    return productos;

  }

  // Crear productos
  async crearProducto(productoDTO: VentasMayoristasProductosDTO): Promise<IVentasMayoristasProductos> {

    const { ventas_mayorista } = productoDTO;

    // Se crea el nuevo producto
    const producto = new this.productosModel(productoDTO);
    const nuevoProducto = await producto.save();

    // Se obtiene pedido
    const pedidoDB = await this.ventasModel.findById(ventas_mayorista);
    pedidoDB.productos.push(nuevoProducto);
    
    let precioTotalPedidoTMP = 0;

    // Se actualizar el pedido
    pedidoDB.productos.map( elemento => {
      precioTotalPedidoTMP += elemento.precio;
    });

    await this.ventasModel.findByIdAndUpdate(ventas_mayorista, { precio_total: precioTotalPedidoTMP, productos: pedidoDB.productos });
    
    // Actualizacion de precio de paquete
    const pedidosDB = await this.ventasModel.find({ paquete: String(pedidoDB.paquete) });
    let precioPaqueteTMP = 0;
    pedidosDB.map( pedido => {
      precioPaqueteTMP += pedido.precio_total;
    })

    await this.paquetesModel.findByIdAndUpdate(String(pedidoDB.paquete), { precio_total: precioPaqueteTMP })

    // return await this.getProducto(String(nuevoProducto._id));
    // return nuevoProducto;
    return this.getProducto(nuevoProducto._id);
  
  }

  // Actualizar productos
  async actualizarProducto(id: string, productoUpdateDTO: any): Promise<IVentasMayoristasProductos> {
    
    const { cantidad, precio } = productoUpdateDTO;

    // Actualizacion de producto en BD
    const producto = await this.productosModel.findByIdAndUpdate(id, productoUpdateDTO, { new: true });

    // Actualizacion de producto en pedido y precio de pedido
    const pedidoDB = await this.ventasModel.findById(producto.ventas_mayorista);

    let precioPedidoTMP = 0;
    pedidoDB.productos.map( elemento => {
      if(String(elemento._id) === String(producto._id)){
        elemento.cantidad = cantidad;
        elemento.precio = precio;
        precioPedidoTMP += precio;    
      }else{
        precioPedidoTMP += elemento.precio;
      }
    })

    await this.ventasModel.findByIdAndUpdate(producto.ventas_mayorista, {precio_total: precioPedidoTMP, productos: pedidoDB.productos} );

    // Actualizacion de precio de paquete
    const pedidosDB = await this.ventasModel.find({ paquete: String(pedidoDB.paquete) });
    let precioPaqueteTMP = 0;
    pedidosDB.map( pedido => {
      precioPaqueteTMP += pedido.precio_total;
    })

    await this.paquetesModel.findByIdAndUpdate(String(pedidoDB.paquete), { precio_total: precioPaqueteTMP })

    return producto;
    
  }

  // Actualizar productos
  async eliminarProducto(id: string): Promise<IVentasMayoristasProductos> {
    
    // Eliminando producto de BD
    const producto = await this.productosModel.findByIdAndDelete(id, { new: true });

    // Eliminando producto de pedido
    const pedidoDB: any = await this.ventasModel.findById(producto.ventas_mayorista);

    // Actualizacion de producto en pedido y precio de pedido
    pedidoDB.productos = pedidoDB.productos.filter( elemento => String(elemento._id) !== String(producto._id) );

    let precioPedidoTMP = 0;
    pedidoDB.productos.map( elemento => {
      precioPedidoTMP += elemento.precio;
    })

    await this.ventasModel.findByIdAndUpdate(producto.ventas_mayorista, {precio_total: precioPedidoTMP, productos: pedidoDB.productos} );

    // Actualizacion de precio de paquete
    const pedidosDB = await this.ventasModel.find({ paquete: String(pedidoDB.paquete) });
    let precioPaqueteTMP = 0;
    pedidosDB.map( pedido => {
      precioPaqueteTMP += pedido.precio_total;
    })

    await this.paquetesModel.findByIdAndUpdate(String(pedidoDB.paquete), { precio_total: precioPaqueteTMP });

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

    productoTMP.map((producto: any) => {
      if (!agregados.includes(String(producto.producto._id))) {
        agregados.push(String(producto.producto._id));
        productosPDF.push({
          productoId: String(producto.producto._id,),
          descripcion: producto.producto.descripcion,
          unidad_medida: producto.unidad_medida.descripcion,
          cantidad: producto.cantidad
        })
      } else {
        productosPDF.map(elemento => {
          if (elemento.productoId === String(producto.producto._id)) {
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


  // Lista de armado de pedidos general
  async generarArmadoPedidosPDF(): Promise<IVentasMayoristasProductos[]> {

    const pipeline = [];

    // Solo los productos pendientes
    pipeline.push({ $match: { activo: true } });

    // Informacion - Venta mayorista
    pipeline.push({
      $lookup: { // Lookup
        from: 'ventas_mayoristas',
        localField: 'ventas_mayorista',
        foreignField: '_id',
        as: 'ventas_mayorista'
      }
    }
    );

    pipeline.push({ $unwind: '$ventas_mayorista' });

    // Informacion - Mayoristas
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'ventas_mayorista.mayorista',
        foreignField: '_id',
        as: 'ventas_mayorista.mayorista'
      }
    }
    );

    pipeline.push({ $unwind: '$ventas_mayorista.mayorista' });

    // Informacion - Producto
    pipeline.push({
      $lookup: { // Lookup
        from: 'productos',
        localField: 'producto',
        foreignField: '_id',
        as: 'producto'
      }
    }
    );

    pipeline.push({ $unwind: '$producto' });


    // Informacion - Unidad de medida
    pipeline.push({
      $lookup: { // Lookup
        from: 'unidad_medida',
        localField: 'producto.unidad_medida',
        foreignField: '_id',
        as: 'producto.unidad_medida'
      }
    }
    );

    pipeline.push({ $unwind: '$producto.unidad_medida' });

    // Informacion - Unidad de medida
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'ventas_mayorista.repartidor',
        foreignField: '_id',
        as: 'ventas_mayorista.repartidor'
      }
    }
    );

    pipeline.push({ $unwind: '$ventas_mayorista.repartidor' });


    // Solo los productos de un repartidor
    // const idRepartidor = new Types.ObjectId(repartidor);
    // pipeline.push({$match: { "ventas_mayorista.repartidor": idRepartidor }});

    // Agrupando resultados por mayorista
    pipeline.push({
      $group: {
        _id: {
          repartidor_apellido: '$ventas_mayorista.repartidor.apellido',
          repartidor_nombre: '$ventas_mayorista.repartidor.nombre',
          mayorista: '$ventas_mayorista.mayorista.descripcion',
          unidad: '$producto.unidad_medida.descripcion',
          producto: '$producto.descripcion',
        },
        cantidad: { $sum: '$cantidad' }
      }
    })


    // Ordenando datos
    pipeline.push({
      $sort: {
        '_id.repartidor_apellido': 1,
        '_id.mayorista': 1,
        '_id.producto': 1
      }
    });

    const productos = await this.productosModel.aggregate(pipeline);

    // let arrayMayoristas: string[] = [];
    // let arrayMayoristasPDF: any[] = [];

    // Arreglo de mayoristas
    // productos.map( elemento => {
    //   if(!arrayMayoristas.includes(elemento._id.mayorista)){
    //     arrayMayoristas.unshift(elemento._id.mayorista);
    //     arrayMayoristasPDF.unshift({
    //       descripcion: elemento._id.mayorista
    //     });
    //   }
    // });

    // PRINT DE PANTALLA - PARA TENER UNA GUIA
    // arrayMayoristas.map(mayorista => {
    //   console.log('----------------------------------');
    //   console.log(`MAYORISTA - ${mayorista}`);
    //   console.log('----------------------------------');
    //   productos.map( producto => {
    //     if(producto._id.mayorista === mayorista){
    //       console.log(`${producto._id.producto}`);      
    //       console.log(`${producto._id.unidad}`);
    //       console.log(`CANTIDAD - ${producto.cantidad}`);
    //       console.log('');      
    //     }
    //   });
    // });


    // GENERACION DE PDF

    let html: any;
    html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/productos_preparacion_pedidos.html', 'utf-8');

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
        productos: productos,
        numero_paquete: null
      },
      path: (process.env.PUBLIC_DIR || './public') + '/pdf/productos_preparacion_pedidos.pdf'
    }

    // Generacion de PDF
    await pdf.create(document, options);

    return productos;

  }


  // Lista de armado de pedidos x repartidor
  async generarArmadoPedidosPorRepartidorPDF(repartidor: string): Promise<IVentasMayoristasProductos[]> {

    const pipeline = [];

    // Solo los productos pendientes
    pipeline.push({ $match: { activo: true } });

    // Informacion - Venta mayorista
    pipeline.push({
      $lookup: { // Lookup
        from: 'ventas_mayoristas',
        localField: 'ventas_mayorista',
        foreignField: '_id',
        as: 'ventas_mayorista'
      }
    }
    );

    pipeline.push({ $unwind: '$ventas_mayorista' });

    // Informacion - Venta mayorista
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'ventas_mayorista.mayorista',
        foreignField: '_id',
        as: 'ventas_mayorista.mayorista'
      }
    }
    );

    pipeline.push({ $unwind: '$ventas_mayorista.mayorista' });

    // Informacion - Producto
    pipeline.push({
      $lookup: { // Lookup
        from: 'productos',
        localField: 'producto',
        foreignField: '_id',
        as: 'producto'
      }
    }
    );

    pipeline.push({ $unwind: '$producto' });


    // Informacion - Unidad de medida
    pipeline.push({
      $lookup: { // Lookup
        from: 'unidad_medida',
        localField: 'producto.unidad_medida',
        foreignField: '_id',
        as: 'producto.unidad_medida'
      }
    }
    );

    pipeline.push({ $unwind: '$producto.unidad_medida' });

    // Solo los productos de un repartidor
    const idRepartidor = new Types.ObjectId(repartidor);
    pipeline.push({$match: { "ventas_mayorista.repartidor": idRepartidor }});

    // Agrupando resultados por mayorista
    pipeline.push({
      $group: {
        _id: {
          repartidor_apellido: '$ventas_mayorista.repartidor.apellido',
          repartidor_nombre: '$ventas_mayorista.repartidor.nombre',
          mayorista: '$ventas_mayorista.mayorista.descripcion',
          unidad: '$producto.unidad_medida.descripcion',
          producto: '$producto.descripcion',
        },
        cantidad: { $sum: '$cantidad' }
      }
    })


    // Ordenando datos
    pipeline.push({
      $sort: {
        '_id.repartidor_apellido': 1,
        '_id.mayorista': 1,
        '_id.producto': 1
      }
    });

    const [productos, repartidorDB] = await Promise.all([
      this.productosModel.aggregate(pipeline),
      this.usuariosModel.findById(repartidor)
    ]);

    // let arrayMayoristas: string[] = [];
    // let arrayMayoristasPDF: any[] = [];

    // Arreglo de mayoristas
    // productos.map( elemento => {
    //   if(!arrayMayoristas.includes(elemento._id.mayorista)){
    //     arrayMayoristas.unshift(elemento._id.mayorista);
    //     arrayMayoristasPDF.unshift({
    //       descripcion: elemento._id.mayorista
    //     });
    //   }
    // });

    // PRINT DE PANTALLA - PARA TENER UNA GUIA
    // arrayMayoristas.map(mayorista => {
    //   console.log('----------------------------------');
    //   console.log(`MAYORISTA - ${mayorista}`);
    //   console.log('----------------------------------');
    //   productos.map( producto => {
    //     if(producto._id.mayorista === mayorista){
    //       console.log(`${producto._id.producto}`);      
    //       console.log(`${producto._id.unidad}`);
    //       console.log(`CANTIDAD - ${producto.cantidad}`);
    //       console.log('');      
    //     }
    //   });
    // });


    // GENERACION DE PDF

    let html: any;
    html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/productos_preparacion_pedidos_por_repartidor.html', 'utf-8');

    var options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
      footer: {
        height: "0mm",
        contents: {}
      }
    }

    const repartidorPDF: any = repartidorDB;

    // Configuraciones de documento
    var document = {
      html: html,
      data: {
        fecha: format(new Date(), 'dd/MM/yyyy'),
        repartidor: repartidorPDF.apellido + ' ' + repartidorPDF.nombre,
        productos: productos,
      },
      path: (process.env.PUBLIC_DIR || './public') + '/pdf/productos_preparacion_pedidos_por_repartidor.pdf'
    }

    // Generacion de PDF
    await pdf.create(document, options);

    return productos;

  }


}
