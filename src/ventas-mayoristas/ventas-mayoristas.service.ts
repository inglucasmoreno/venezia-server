import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IVentasMayoristasProductos } from 'src/ventas-mayoristas-productos/interface/ventas-mayoristas-productos.interface';
import { IVentasMayoristas } from './interface/ventas-mayoristas.interface';
import * as fs from 'fs';
import * as pdf from 'pdf-creator-node';
import { add, format } from 'date-fns';
import { ICuentasCorrientesMayoristas } from 'src/cuentas-corrientes-mayoristas/interface/cuentas-corrientes-mayoristas.interface';
import { ICobrosMayoristas } from 'src/cobros-mayoristas/interface/cobros-mayoristas.interface';
import { ICobrosPedidos } from 'src/cobros-pedidos/inteface/cobros-pedidos.interface';

@Injectable()
export class VentasMayoristasService {

  constructor(
    @InjectModel('VentasMayoristas') private readonly ventasModel: Model<IVentasMayoristas>,
    @InjectModel('VentasMayoristasProductos') private readonly productosModel: Model<IVentasMayoristasProductos>,
    @InjectModel('CuentasCorrientesMayoristas') private readonly cuentasCorrientesModel: Model<ICuentasCorrientesMayoristas>,
    @InjectModel('CobrosMayoristas') private readonly cobrosMayoristasModel: Model<ICobrosMayoristas>,
    @InjectModel('CobrosPedidosMayoristas') private readonly cobrosPedidosMayoristasModel: Model<ICobrosPedidos>,
  ) { }

  // Venta por ID
  async getVenta(id: string): Promise<IVentasMayoristas> {

    const ventaDB = await this.ventasModel.findById(id);
    if (!ventaDB) throw new NotFoundException('El venta no existe');

    const pipeline = [];

    // Venta por ID
    const idVenta = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idVenta } })

    // Informacion - Repartidor
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'repartidor',
        foreignField: '_id',
        as: 'repartidor'
      }
    }
    );

    pipeline.push({ $unwind: '$repartidor' });

    // Informacion - Mayorista
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'mayorista',
        foreignField: '_id',
        as: 'mayorista'
      }
    }
    );

    pipeline.push({ $unwind: '$mayorista' });

    // Informacion - Usuario creador
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

    // Informacion - Usuario actualizador
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

    const venta = await this.ventasModel.aggregate(pipeline);
    return venta[0];

  }

  // Listar ventas
  async listarVentas(querys: any): Promise<any> {

    const {
      columna,
      direccion,
      repartidor,
      mayorista,
      desde,
      registerpp,
      estado,
      parametro,
      fechaDesde,
      fechaHasta,
      activo
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({ $match: {} });

    // Repartido por ID
    if (repartidor && repartidor !== '') {
      const idRepartidor = new Types.ObjectId(repartidor);
      pipeline.push({ $match: { repartidor: idRepartidor } })
      pipelineTotal.push({ $match: { repartidor: idRepartidor } })
    }

    // Mayorista por ID
    if (mayorista && mayorista !== '') {
      const idMayorista = new Types.ObjectId(mayorista);
      pipeline.push({ $match: { mayorista: idMayorista } })
      pipelineTotal.push({ $match: { mayorista: idMayorista } })
    }

    // Filtro - Activo / Inactivo
    let filtroActivo = {};
    if (activo && activo !== '') {
      filtroActivo = { activo: activo === 'true' ? true : false };
      pipeline.push({ $match: filtroActivo });
      pipelineTotal.push({ $match: filtroActivo });
    }

    // Filtro por estado
    if (estado && estado !== '') {
      pipeline.push({ $match: { estado } });
      pipelineTotal.push({ $match: { estado } });
    }

    // Filtro - Fecha desde
    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_pedido: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
      pipelineTotal.push({
        $match: {
          fecha_pedido: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
    }

    // Filtro - Fecha hasta
    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_pedido: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
      pipelineTotal.push({
        $match: {
          fecha_pedido: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    // Informacion - Repartidor
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'repartidor',
        foreignField: '_id',
        as: 'repartidor'
      }
    }
    );

    pipeline.push({ $unwind: '$repartidor' });

    // Informacion - Mayorista
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'mayorista',
        foreignField: '_id',
        as: 'mayorista'
      }
    }
    );

    pipeline.push({ $unwind: '$mayorista' });

    // Informacion - Repartidor
    pipelineTotal.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'repartidor',
        foreignField: '_id',
        as: 'repartidor'
      }
    }
    );

    pipelineTotal.push({ $unwind: '$repartidor' });

    // Informacion - Mayorista
    pipelineTotal.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'mayorista',
        foreignField: '_id',
        as: 'mayorista'
      }
    }
    );

    pipelineTotal.push({ $unwind: '$mayorista' });

    // Filtro por parametros
    if (parametro && parametro !== '') {
      const regex = new RegExp(parametro, 'i');
      pipeline.push({ $match: { $or: [{ numero: Number(parametro) }] } });
      pipelineTotal.push({ $match: { $or: [{ numero: Number(parametro) }] } });
    }

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    // Paginacion
    pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

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

    // pipeline.push({ $unwind: '$updatorUser' });

    const [ventas, ventasTotal] = await Promise.all([
      this.ventasModel.aggregate(pipeline),
      this.ventasModel.aggregate(pipelineTotal)
    ]);

    // Calculo de deuda
    let totalDeuda = 0;
    let totalIngresos = 0;
    let totalMonto = 0;
    ventasTotal.map(venta => {
      if (venta.estado === 'Deuda') totalDeuda += venta.deuda_monto;
      totalIngresos += venta.monto_recibido;
      totalMonto += venta.precio_total;
    })

    return {
      ventas,
      totalItems: ventasTotal.length,
      totalDeuda,
      totalIngresos,
      totalMonto
    };

  }

  // Crear ventas - pedido
  async crearVenta(data: any): Promise<any> {

    const { pedido, productos } = data;

    // Numero de pedido
    const ultimoPedido = await this.ventasModel.find().sort({ createdAt: -1 }).limit(1);

    let numero = 0;

    if (ultimoPedido.length === 0) numero = 1;
    else numero = ultimoPedido[0].numero + 1;

    const dataPedido = {
      ...pedido,
      fecha_pedido: new Date(),
      numero
    };

    // Se crea el pedido
    const nuevaVenta = new this.ventasModel(dataPedido);
    const pedidoDB = await nuevaVenta.save();

    // Carga de productos
    const productosTMP: any[] = productos;
    for (const producto of productosTMP) { producto.ventas_mayorista = pedidoDB._id; }

    await this.productosModel.insertMany(productos);

    return 'Pedido generado correctamente';

  }

  // Actualizar venta
  async actualizarVenta(id: string, ventaUpdateDTO: any): Promise<IVentasMayoristas> {

    const { activo, estado, fecha_pedido } = ventaUpdateDTO;

    if (fecha_pedido) {
      ventaUpdateDTO.fecha_pedido = add(new Date(fecha_pedido), { hours: 3 });
    }

    // Se finalizan los productos de la venta
    if (!activo) {
      await this.productosModel.updateMany({ ventas_mayorista: id }, { activo: false });
    };

    // Se envia el producto - Actualizacion de fecha de pedido
    if (estado && estado === 'Enviado') ventaUpdateDTO.fecha_pedido = new Date();

    // Se actualiza la venta
    const venta = await this.ventasModel.findByIdAndUpdate(id, ventaUpdateDTO, { new: true });

    return venta;

  }

  // Completar venta
  async completarVenta(id: string, data: any): Promise<IVentasMayoristas> {

    const {
      fecha_pedido,
      deuda_monto,
      monto_cuenta_corriente,
      monto_anticipo,
      estado,
      monto_recibido,
      usuario
    } = data;

    // Adaptando fecha de pedido
    data.fecha_pedido = add(new Date(fecha_pedido), { hours: 3 });

    // Se finalizan los productos de la venta
    await this.productosModel.updateMany({ ventas_mayorista: id }, { activo: false });

    // Se actualiza la venta
    const venta = await this.ventasModel.findByIdAndUpdate(id, data, { new: true });

    // Impactos en cuenta corriente
    if (deuda_monto > 0 || monto_anticipo > 0 || monto_cuenta_corriente > 0) {

      const cuentaCorrienteDB = await this.cuentasCorrientesModel.findOne({ mayorista: venta.mayorista });

      let nuevoSaldo = cuentaCorrienteDB.saldo;

      if (deuda_monto > 0) nuevoSaldo -= deuda_monto; // Impacto negativo
      if (monto_anticipo > 0) nuevoSaldo += monto_anticipo; // Impacto positivo
      if (monto_cuenta_corriente > 0) nuevoSaldo -= monto_cuenta_corriente; // Impacto positivo

      await this.cuentasCorrientesModel.findByIdAndUpdate(cuentaCorrienteDB._id, { saldo: nuevoSaldo })

    }

    // Se genera el cobro

    const ultimoCobro = await this.cobrosMayoristasModel.find().sort({ createdAt: -1 }).limit(1);

    let proximoNumeroCobro = 1;
    if (ultimoCobro.length !== 0) proximoNumeroCobro = ultimoCobro[0].nro + 1;

    const dataCobro = {
      fecha_cobro: add(new Date(fecha_pedido), { hours: 3 }),
      nro: proximoNumeroCobro,
      tipo: 'Cobro',
      mayorista: venta.mayorista,
      repartidor: venta.repartidor,
      anticipo: monto_anticipo,
      monto: monto_recibido,
      monto_total: venta.precio_total,
      ingreso: false,
      activo: false,
      creatorUser: usuario,
      updatorUser: usuario
    }

    const nuevoCobro = new this.cobrosMayoristasModel(dataCobro);
    const cobroDB = await nuevoCobro.save();

    // Generacion de relacion
    const dataRelacion = {
      mayorista: venta.mayorista,
      cobro: cobroDB._id,
      pedido: venta._id,
      cancelado: estado === 'Deuda' ? false : true,
      monto_total: venta.precio_total,
      monto_cobrado: monto_recibido,
      monto_deuda: venta.precio_total,
      monto_cuenta_corriente: monto_cuenta_corriente,
      activo: false,
      creatorUser: usuario,
      updatorUser: usuario
    }

    const nuevaRelacion = new this.cobrosPedidosMayoristasModel(dataRelacion);
    await nuevaRelacion.save()

    return venta;

  }

  // Generar PDF - Detalles de pedido
  async generarDetallesPDF(id: string): Promise<any> {

    // Datos de pedido
    const pedido: any = await this.getVenta(id);

    // Productos del pedido

    const pipeline = [];
    pipeline.push({ $match: {} });

    const idPedido = new Types.ObjectId(id);
    pipeline.push({ $match: { ventas_mayorista: idPedido } })

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

    // Ordenando datos
    const ordenar: any = {};
    ordenar['descripcion'] = 1;
    pipeline.push({ $sort: ordenar });

    const productos = await this.productosModel.aggregate(pipeline);

    let productosPedido: any[] = [];

    productos.map(producto => productosPedido.push({
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
      repartidor: pedido.repartidor.apellido + ' ' + pedido.repartidor.nombre,
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

  // Detalles de deuda - Mayoristas
  async detallesDeudasPDF(): Promise<any> {

    const pipelineDeudas = [];
    const pipelineTotales = [];

    pipelineDeudas.push({ $match: { estado: 'Deuda' } });
    pipelineTotales.push({ $match: { estado: 'Deuda' } });

    // Informacion - Unidad de medida
    pipelineTotales.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'mayorista',
        foreignField: '_id',
        as: 'mayorista'
      }
    }
    );

    pipelineTotales.push({ $unwind: '$mayorista' });

    // Informacion - Unidad de medida
    pipelineDeudas.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'mayorista',
        foreignField: '_id',
        as: 'mayorista'
      }
    }
    );

    pipelineDeudas.push({ $unwind: '$mayorista' });

    // Ordenando datos
    const ordenar: any = {};
    ordenar['mayorista.descripcion'] = 1;
    pipelineDeudas.push({ $sort: ordenar });
    pipelineTotales.push({ $sort: ordenar });

    pipelineTotales.push({
      $group: {
        _id: '$mayorista.descripcion',
        deuda_monto: { $sum: "$deuda_monto" },
      }
    })

    const [deudasTotales, deudas] = await Promise.all([
      this.ventasModel.aggregate(pipelineTotales),
      this.ventasModel.aggregate(pipelineDeudas),
    ]);

    let deudasTotalesPDF: any[] = [];
    let deudasPDF: any[] = [];

    deudasTotales.map(total => {
      deudasTotalesPDF.push({
        mayorista: total._id,
        deuda: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total.deuda_monto),
      })
    })

    deudas.map(deuda => {
      deudasPDF.push({
        fecha: deuda.fecha_pedido ? format(deuda.fecha_pedido, 'dd/MM/yyyy') : format(deuda.createdAt, 'dd/MM/yyyy'),
        nro: deuda.numero,
        total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(deuda.precio_total),
        mayorista: deuda.mayorista.descripcion,
        deuda: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(deuda.deuda_monto),
      })
    })

    let html: any;
    html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/deudas_mayoristas.html', 'utf-8');

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
        deudasTotalesPDF,
        deudasPDF
      },
      options: {},
      path: (process.env.PUBLIC_DIR || './public') + '/pdf/deudas_mayoristas.pdf'
    }

    // Generacion de PDF
    await pdf.create(document, options);



    return 'Reporte generado correctamente';

  }

  // Reporte -> Repartidores
  async reporteRepartidores(data: any): Promise<any> {

    const {
      fechaDesde,
      fechaHasta,
      repartidor
    } = data;

    const pipeline = [];

    pipeline.push({$match:{ $or:[{estado: 'Completado'}, {estado: 'Deuda'}] }});

    // Repartidor
    if(repartidor && repartidor.trim() !== ''){
      const idRepartidor = new Types.ObjectId(repartidor);
      pipeline.push({ $match: { repartidor: idRepartidor } });
    }

    // Informacion - Repartidor
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'repartidor',
        foreignField: '_id',
        as: 'repartidor'
      }
    }
    );

    pipeline.push({ $unwind: '$repartidor' });

    // Filtro - Fecha desde
    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_pedido: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
    }

    // Filtro - Fecha hasta
    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_pedido: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    pipeline.push({
      $group: {
        _id: '$repartidor',
        cantidad_ventas: { $sum: 1 },
        total_recibido: { $sum: "$monto_recibido" },
        total_ventas: { $sum: "$precio_total" },
        total_deudas: { $sum: "$deuda_monto" },
        total_anticipos: { $sum: "$monto_anticipo" },
        total_cuenta_corriente: { $sum: "$monto_cuenta_corriente" },
      }
    })

    const reportes = await this.ventasModel.aggregate(pipeline);

    return reportes;

  }

  // Envio masivo de pedidos
  async envioMasivo(repartidor: string): Promise<any> {
  
    const fecha_pedido = new Date(); // Se actualiza la fecha a la de hoy

    if(repartidor === 'todos'){
      await this.ventasModel.updateMany({ estado: 'Pendiente', activo: true }, { estado: 'Enviado', fecha_pedido });
    }else{
      await this.ventasModel.updateMany({ estado: 'Pendiente', activo: true , repartidor }, { estado: 'Enviado', fecha_pedido });
    }
    return 'Pedidos enviados';
  
  }

}
