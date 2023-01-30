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
import { IMayoristasGastos } from 'src/mayoristas-gastos/interface/mayoristas-gastos.interface';
import { IMayoristasIngresos } from 'src/mayoristas-ingresos/interface/mayoristas-ingresos.interface';
import { IPaquetes } from 'src/paquetes/interface/paquetes.interface';

@Injectable()
export class VentasMayoristasService {

  constructor(
    @InjectModel('Paquetes') private readonly paquetesModel: Model<IPaquetes>,
    @InjectModel('VentasMayoristas') private readonly ventasModel: Model<IVentasMayoristas>,
    @InjectModel('VentasMayoristasProductos') private readonly productosModel: Model<IVentasMayoristasProductos>,
    @InjectModel('CuentasCorrientesMayoristas') private readonly cuentasCorrientesModel: Model<ICuentasCorrientesMayoristas>,
    @InjectModel('CobrosMayoristas') private readonly cobrosMayoristasModel: Model<ICobrosMayoristas>,
    @InjectModel('CobrosPedidosMayoristas') private readonly cobrosPedidosMayoristasModel: Model<ICobrosPedidos>,
    @InjectModel('MayoristasGastos') private readonly gastosModel: Model<IMayoristasGastos>,
    @InjectModel('MayoristasIngresos') private readonly ingresosModel: Model<IMayoristasIngresos>,
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
      paquete,
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

    //  Por paquete
    if (paquete && paquete !== '') {
      const idPaquete = new Types.ObjectId(paquete);
      pipeline.push({ $match: { paquete: idPaquete } })
      pipelineTotal.push({ $match: { paquete: idPaquete } })
    }

    // Por repartidor
    if (repartidor && repartidor !== '') {
      const idRepartidor = new Types.ObjectId(repartidor);
      pipeline.push({ $match: { repartidor: idRepartidor } })
      pipelineTotal.push({ $match: { repartidor: idRepartidor } })
    }

    // Por mayorista
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
          fecha_pedido: { $gte: add(new Date(fechaDesde), { hours: 0 }) }
        }
      });
      pipelineTotal.push({
        $match: {
          fecha_pedido: { $gte: add(new Date(fechaDesde), { hours: 0 }) }
        }
      });
    }

    // Filtro - Fecha hasta
    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_pedido: { $lte: add(new Date(fechaHasta), { days: 1, hours: 0 }) }
        }
      });
      pipelineTotal.push({
        $match: {
          fecha_pedido: { $lte: add(new Date(fechaHasta), { days: 1, hours: 0 }) }
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

    // Informacion - Paquete
    pipeline.push({
      $lookup: { // Lookup
        from: 'paquetes',
        localField: 'paquete',
        foreignField: '_id',
        as: 'paquete'
      }
    }
    );

    pipeline.push({ $unwind: '$paquete' });

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

    // Se agrega valores de cuenta corriente
    const cuentas_corrientes = await this.cuentasCorrientesModel.find();

    // Calculo de deuda
    let totalDeuda = 0;
    let totalIngresos = 0;
    let totalMonto = 0;

    // Calculos de totales
    ventasTotal.map(venta => {
      if (venta.estado === 'Deuda') totalDeuda += venta.deuda_monto;
      totalIngresos += venta.monto_recibido;
      totalMonto += venta.precio_total;
    })

    ventas.map(venta => {

      // Se le agrega la cuenta corriente
      venta.cuenta_corriente = cuentas_corrientes.find((cc: any) => {
        return String(venta.mayorista._id) === String(cc.mayorista);
      });

      venta.productos.sort(function (a, b) {
        // A va primero que B
        if (a.descripcion < b.descripcion)
          return -1;
        // B va primero que A
        else if (a.descripcion > b.descripcion)
          return 1;
        // A y B son iguales
        else
          return 0;
      });

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

    const idMayorista = new Types.ObjectId(pedido.mayorista);
    const idPaquete = new Types.ObjectId(pedido.paquete);

    // Se verifica si ya hay un pedido creado para este mayorista en el paquete actual    
    const pipeline = [];
    pipeline.push({ $match: { $and: [{ paquete: idPaquete }, { mayorista: idMayorista }] } });
    const pedidoRepetido = await this.ventasModel.aggregate(pipeline);

    if (pedidoRepetido.length > 0) throw new NotFoundException('El mayorista ya tiene un pedido en este paquete');

    // Numero de pedido
    const ultimoPedido = await this.ventasModel.find().sort({ createdAt: -1 }).limit(1);

    let numero = 0;

    if (ultimoPedido.length === 0) numero = 1;
    else numero = ultimoPedido[0].numero + 1;

    // Adaptacion de productos
    let productosPedido = [];

    // productos.map( producto => {
    //   productosPedido.push({
    //     _id: producto.producto._id,
    //     descripcion: producto.descripcion,
    //     unidad_medida: producto.unidad_medida,
    //     unidad_medida_descripcion: producto.unidad_medida_descripcion,
    //     cantidad: producto.cantidad,
    //     precio_unitario: producto.precio_unitario,
    //     precio: producto.precio
    //   })  
    // });

    // Datos del pedido
    const dataPedido = {
      ...pedido,
      productos: [],
      fecha_pedido: new Date(),
      numero
    };

    // Se crea el pedido
    const nuevaVenta = new this.ventasModel(dataPedido);
    const pedidoDB = await nuevaVenta.save();

    // Carga de productos
    const productosTMP: any[] = productos;

    for (const producto of productosTMP) { producto.ventas_mayorista = pedidoDB._id; }

    productos.map((producto: any) => {
      producto.venta_mayoristas = pedidoDB._id;
      productosPedido.push({
        _id: producto.producto._id,
        descripcion: producto.descripcion,
        unidad_medida: producto.unidad_medida,
        unidad_medida_descripcion: producto.unidad_medida_descripcion,
        cantidad: producto.cantidad,
        precio_unitario: producto.precio_unitario,
        precio: producto.precio
      });
    })

    const productosDB: any[] = await this.productosModel.insertMany(productos);

    const nuevoPedidoDB = await this.ventasModel.findByIdAndUpdate(pedidoDB._id, { productos: productosDB });

    // Se actualizar el paquete
    const pedidosDB = await this.ventasModel.find({ paquete: String(pedidoDB.paquete) });

    let precioPaqueteTMP = 0;
    let cantidadPedidosTMP = 0;

    pedidosDB.map(pedido => {
      cantidadPedidosTMP += 1;
      precioPaqueteTMP += pedido.precio_total;
    })

    await this.paquetesModel.findByIdAndUpdate(String(pedidoDB.paquete), { precio_total: precioPaqueteTMP, cantidad_pedidos: cantidadPedidosTMP });

    return nuevoPedidoDB;

  }

  // Actualizar venta
  async actualizarVenta(id: string, ventaUpdateDTO: any): Promise<IVentasMayoristas> {

    const { activo, fecha_pedido } = ventaUpdateDTO;

    if (fecha_pedido) {
      ventaUpdateDTO.fecha_pedido = add(new Date(fecha_pedido), { hours: 3 });
    }

    // Se finalizan los productos de la venta
    if (!activo) {
      await this.productosModel.updateMany({ ventas_mayorista: id }, { activo: false });
    };

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

    pipeline.push({ $match: { $or: [{ estado: 'Completado' }, { estado: 'Deuda' }] } });

    // Repartidor
    if (repartidor && repartidor.trim() !== '') {
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
  async envioMasivo(repartidor: string, data: any): Promise<any> {

    const { fecha_pedidos } = data;

    const adj_fecha_pedido = add(new Date(fecha_pedidos), { hours: 3 });

    // Actualizacion de pedidos
    if (repartidor === 'todos') {

      await this.ventasModel.updateMany({ estado: 'Pendiente', activo: true }, { estado: 'Enviado', fecha_pedido: adj_fecha_pedido });
      await this.productosModel.updateMany({ activo: true }, { activo: false });

    } else {

      // Actualizacion de pedidos
      await this.ventasModel.updateMany({ estado: 'Pendiente', activo: true, repartidor }, { estado: 'Enviado', fecha_pedido: adj_fecha_pedido });

      // Actualizacion de productos
      const pipeline = [];
      pipeline.push({ $match: { activo: true } });

      // Informacion - Repartidor
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

      const idRepartidor = new Types.ObjectId(repartidor);
      pipeline.push({ $match: { 'ventas_mayorista.repartidor': idRepartidor } })

      const productosDB = await this.productosModel.aggregate(pipeline);

      productosDB.map(async producto => {
        await this.productosModel.findByIdAndUpdate(producto._id, { activo: false });
      });

    }

    return 'Pedidos enviados';

  }

  // Completar pedidos de forma masiva
  async completarMasivo(data: any): Promise<any> {

    const { pedidos, fecha_pedidos, usuario, ingresos, gastos } = data;

    const ajs_fecha_pedidos = add(new Date(fecha_pedidos), { hours: 3 });

    // Ultimo cobro
    const ultimoCobro = await this.cobrosMayoristasModel.find().sort({ createdAt: -1 }).limit(1);
    let proximoNumeroCobro = 1;
    if (ultimoCobro.length !== 0) proximoNumeroCobro = ultimoCobro[0].nro + 1;

    // Se recorren los pedidos
    pedidos.map(async pedido => {

      // Baja de productos
      await this.productosModel.updateMany({ ventas_mayorista: pedido._id }, { activo: false });

      // Actualizacion de venta
      const dataVenta = {
        fecha_pedido: ajs_fecha_pedidos,
        deuda: pedido.deuda,
        estado: pedido.estado,
        deuda_monto: pedido.deuda_monto,
        monto_recibido: pedido.monto_cobrado,
        monto_anticipo: pedido.monto_anticipo,
      }

      await this.ventasModel.findByIdAndUpdate(pedido._id, dataVenta);

      // Generacion de cobro
      const dataCobro = {
        nro: proximoNumeroCobro,
        fecha_cobro: ajs_fecha_pedidos,
        tipo: 'Cobro',
        mayorista: pedido.mayoristaID,
        repartidor: pedido.repartidorID,
        anticipo: pedido.monto_anticipo,
        monto_total: pedido.precio_total,
        monto: pedido.monto_cobrado,
        ingreso: false,
        activo: false,
        creatorUser: usuario,
        updatorUser: usuario
      }

      const nuevoCobro = new this.cobrosMayoristasModel(dataCobro);
      const cobroDB = await nuevoCobro.save();

      // Generacion relacion cobro - pedido
      const dataRelacionCobroPedido = {
        cobro: cobroDB._id,
        pedido: pedido._id,
        mayorista: pedido.mayoristaID,
        cancelado: !pedido.deuda,
        monto_total: pedido.precio_total,
        monto_cobrado: pedido.monto_cobrado,
        monto_deuda: pedido.deuda_monto,
        monto_cuenta_corriente: 0,
        creatorUser: usuario,
        updatorUser: usuario
      }

      const nuevaRelacion = new this.cobrosPedidosMayoristasModel(dataRelacionCobroPedido);
      await nuevaRelacion.save();

      proximoNumeroCobro += 1;

      // Impacto en cuenta corriente

      const cuentaCorrienteDB = await this.cuentasCorrientesModel.findOne({ mayorista: pedido.mayoristaID });
      const nuevoSaldo = cuentaCorrienteDB.saldo + pedido.diferencia;
      await this.cuentasCorrientesModel.findByIdAndUpdate(cuentaCorrienteDB._id, { saldo: nuevoSaldo });

    });

    // Impacto de gastos e ingresos

    gastos.map(async gasto => {
      gasto.fecha_gasto = ajs_fecha_pedidos;
      const nuevoGasto = new this.gastosModel(gasto);
      await nuevoGasto.save();
    })

    ingresos.map(async ingreso => {
      ingreso.fecha_ingreso = ajs_fecha_pedidos;
      const nuevoIngreso = new this.ingresosModel(ingreso);
      await nuevoIngreso.save();
    })

    // const fecha_pedido = new Date(); // Se actualiza la fecha a la de hoy

    // let pedidosEnviados: any[];

    // if (repartidor === 'todos') {
    //   pedidosEnviados = await this.ventasModel.find({ activo: true, estado: 'Enviado' });
    // } else {
    //   pedidosEnviados = await this.ventasModel.find({ activo: true, estado: 'Enviado', repartidor });
    // }

    // pedidosEnviados.map( async pedido => {

    // Se finalizan los productos de la venta
    //   await this.productosModel.updateMany({ ventas_mayorista: pedido._id }, { activo: false });

    //   const dataPedido = {
    //     estado: 'Completado',
    //     deuda: false,
    //     monto_recibido: pedido.precio_total,
    //     deuda_monto: 0,
    //     monto_cuenta_corriente: 0, // REVISAR
    //     monto_anticipo: 0
    //   }

    //   // Actualizacion de estado de pedido
    //   await this.ventasModel.findByIdAndUpdate(pedido._id, dataPedido);


    // });

    return 'Pedidos enviados';

  }

  async talonariosMasivosPDF(): Promise<any> {

    // DATOS DE PEDIDOS

    const pipeline = [];
    pipeline.push({ $match: { estado: 'Pendiente' } });

    // Informacion - Paquete
    pipeline.push({
      $lookup: { // Lookup
        from: 'paquetes',
        localField: 'paquete',
        foreignField: '_id',
        as: 'paquete'
      }
    }
    );

    pipeline.push({ $unwind: '$paquete' });

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

    // Ordenando datos
    const ordenar: any = {};
    ordenar['repartidor.apellido'] = 1;
    pipeline.push({ $sort: ordenar });

    var pedidosPDF: any = [];

    const pedidos = await this.ventasModel.aggregate(pipeline);

    // Generando datos para generacion PDF
    pedidos.map(async pedido => {

      pedidosPDF.push({
        pedido: String(pedido._id),
        fecha: format(new Date(), 'dd/MM/yyyy'),
        mayorista: pedido.mayorista.descripcion,
        telefono: pedido.mayorista.telefono,
        direccion: pedido.mayorista.direccion,
        numero_pedido: pedido.numero,
        numero_paquete: pedido.paquete.numero,
        total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pedido.precio_total),
        repartidor: pedido.repartidor.apellido + ' ' + pedido.repartidor.nombre,
      })

    })


    // DATOS DE PRODUCTOS

    const pipelineProductos = [];
    pipelineProductos.push({ $match: { activo: true } });

    // Informacion - Unidad de medida
    pipelineProductos.push({
      $lookup: { // Lookup
        from: 'unidad_medida',
        localField: 'unidad_medida',
        foreignField: '_id',
        as: 'unidad_medida'
      }
    }
    );

    pipelineProductos.push({ $unwind: '$unidad_medida' });

    let productosPDF = [];

    const productos = await this.productosModel.aggregate(pipelineProductos);

    productos.map(producto => {
      productosPDF.push({
        pedido: String(producto.ventas_mayorista),
        descripcion: producto.descripcion,
        unidad_medida: producto.unidad_medida.descripcion,
        precio: producto.precio,
        precio_unitario: producto.precio_unitario,
        cantidad: producto.cantidad
      })
    })

    // UNIFICANDO INFORMACION

    pedidosPDF.map(pedido => {

      let variable = 0;

      productosPDF.map(producto => {
        if (producto.pedido === pedido.pedido) {
          variable += 1;
          pedido[`descripcion${variable}`] = producto.descripcion;
          pedido[`unidad_medida${variable}`] = producto.unidad_medida;
          pedido[`cantidad${variable}`] = producto.cantidad;
          pedido[`precio${variable}`] = producto.precio;
          pedido[`precio_unitario${variable}`] = producto.precio_unitario;
        }
      })

    })

    let html: any;
    html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/talonarios_masivos.html', 'utf-8');

    var options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
      footer: {
        height: "0mm",
        contents: {}
      }
    }

    const data = {
      fecha: format(new Date(), 'dd/MM/yyyy'),
      pedidos: pedidosPDF
    }

    // Configuraciones de documento
    var document = {
      html: html,
      data,
      path: (process.env.PUBLIC_DIR || './public') + '/pdf/talonarios_masivos.pdf'
    }

    // Generacion de PDF
    await pdf.create(document, options);

    return 'Generacion de PDF correcta';

  }

  // Eliminar venta
  async eliminarVenta(id: string): Promise<any> {

    // Se eliminan los productos del pedido
    await this.productosModel.deleteMany({ ventas_mayorista: id });

    // Se elimina el pedido
    const ventaDB = await this.ventasModel.findByIdAndDelete(id);

    // Actualizacion de precio de paquete
    const pedidosDB = await this.ventasModel.find({ paquete: String(ventaDB.paquete) });
    let precioPaqueteTMP = 0;
    pedidosDB.map(pedido => {
      precioPaqueteTMP += pedido.precio_total;
    })

    const paqueteDB = await this.paquetesModel.findByIdAndUpdate(String(ventaDB.paquete), { precio_total: precioPaqueteTMP });

    // Actualizacion de cantidad de paquetes
    await this.paquetesModel.findByIdAndUpdate(String(ventaDB.paquete), { cantidad_pedidos: paqueteDB.cantidad_pedidos - 1 });

    return ventaDB;

  }


}
