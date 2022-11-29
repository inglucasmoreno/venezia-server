import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model, Types } from 'mongoose';
import { ICobrosMayoristas } from 'src/cobros-mayoristas/interface/cobros-mayoristas.interface';
import { IMayoristasGastos } from 'src/mayoristas-gastos/interface/mayoristas-gastos.interface';
import { IMayoristasIngresos } from 'src/mayoristas-ingresos/interface/mayoristas-ingresos.interface';
import { IVentasMayoristas } from 'src/ventas-mayoristas/interface/ventas-mayoristas.interface';
import { CajasMayoristasUpdateDTO } from './dto/cajas-mayoristas-update.dto';
import { CajasMayoristasDTO } from './dto/cajas-mayoristas.dto';
import { ICajasMayoristas } from './interface/cajas-mayoristas.interface';

@Injectable()
export class CajasMayoristasService {

  constructor(
    @InjectModel('CajasMayoristas') private readonly cajasMayoristasModel: Model<ICajasMayoristas>,
    @InjectModel('GastosMayoristas') private readonly gastosMayoristasModel: Model<IMayoristasGastos>,
    @InjectModel('IngresosMayoristas') private readonly ingresosMayoristasModel: Model<IMayoristasIngresos>,
    @InjectModel('VentasMayoristas') private readonly ventasMayoristasModel: Model<IVentasMayoristas>,
    @InjectModel('CobrosMayoristas') private readonly cobrosModel: Model<ICobrosMayoristas>,
  ) { }

  // Caja por ID
  async getCaja(id: string): Promise<ICajasMayoristas> {

    const cajaDB = await this.cajasMayoristasModel.findById(id);
    if (!cajaDB) throw new NotFoundException('La caja no existe');

    const pipeline = [];

    // Caja por ID
    const idCaja = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idCaja } })

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
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
        from: 'usuarios',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$updatorUser' });

    const caja = await this.cajasMayoristasModel.aggregate(pipeline);

    return caja[0];

  }

  // Listar cajas
  async listarCajas(querys: any): Promise<any> {

    const {
      columna,
      direccion,
      desde,
      registerpp,
      fechaDesde,
      fechaHasta,
      parametro
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({ $match: {} });

    // Filtro - Fecha desde
    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
      pipelineTotal.push({
        $match: {
          createdAt: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
    }

    // Filtro - Fecha hasta
    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
      pipelineTotal.push({
        $match: {
          createdAt: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
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
        from: 'usuarios',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$updatorUser' });

    // Filtro por parametros
    if (parametro && parametro !== '') {

      const porPartes = parametro.split(' ');
      let parametroFinal = '';

      for (var i = 0; i < porPartes.length; i++) {
        if (i > 0) parametroFinal = parametroFinal + porPartes[i] + '.*';
        else parametroFinal = porPartes[i] + '.*';
      }

      const regex = new RegExp(parametroFinal, 'i');
      pipeline.push({ $match: { $or: [{ 'creatorUser.apellido': regex }, { 'creatorUser.nombre': regex }] } });
      pipelineTotal.push({ $match: { $or: [{ 'creatorUser.apellido': regex }, { 'creatorUser.nombre': regex }] } });

    }

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    // Paginacion
    pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

    const [cajas, cajasTotal] = await Promise.all([
      this.cajasMayoristasModel.aggregate(pipeline),
      this.cajasMayoristasModel.aggregate(pipelineTotal),
    ])

    return {
      cajas,
      totalItems: cajasTotal.length
    };

  }

  // Calculos iniciales
  async calculosIniciales(querys: any): Promise<any> {

    const { columna, direccion, repartidor } = querys;

    const pipeline = [];
    const pipelineGastos = [];
    const pipelineTotalGastos = [];
    const pipelineIngresos = [];
    const pipelineTotalIngresos = [];
    const pipelineCobros = [];

    // Solo los activos
    pipeline.push({ $match: { activo: true } });
    pipelineGastos.push({ $match: { activo: true } });
    pipelineTotalGastos.push({ $match: { activo: true } });
    pipelineIngresos.push({ $match: { activo: true } });
    pipelineTotalIngresos.push({ $match: { activo: true } });
    pipelineCobros.push({ $match: { activo: true } });

    // Solo de un repartidor en particular
    if (repartidor && repartidor !== '') {
      const idRepartidor = new Types.ObjectId(repartidor);
      pipeline.push({ $match: { repartidor: idRepartidor } });
      pipelineGastos.push({ $match: { repartidor: idRepartidor } });
      pipelineTotalGastos.push({ $match: { repartidor: idRepartidor } });
      pipelineIngresos.push({ $match: { repartidor: idRepartidor } });
      pipelineTotalIngresos.push({ $match: { repartidor: idRepartidor } });
      pipelineCobros.push({ $match: { repartidor: idRepartidor } });
    }

    // Informacion de mayorista
    pipelineCobros.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'mayorista',
        foreignField: '_id',
        as: 'mayorista'
      }
    }
    );

    // Informacion de repartidor
    pipelineCobros.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'repartidor',
        foreignField: '_id',
        as: 'repartidor'
      }
    }
    );

    pipelineCobros.push({ $unwind: '$repartidor' });    

    // Informacion de tipo de gasto
    pipelineGastos.push({
      $lookup: { // Lookup
        from: 'mayoristas_tipos_gastos',
        localField: 'tipo_gasto',
        foreignField: '_id',
        as: 'tipo_gasto'
      }
    }
    );

    pipelineGastos.push({ $unwind: '$tipo_gasto' });

    // Informacion de repartidor
    pipelineGastos.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'repartidor',
        foreignField: '_id',
        as: 'repartidor'
      }
    }
    );

    pipelineGastos.push({ $unwind: '$repartidor' });

    // Informacion de tipo de ingresos
    pipelineIngresos.push({
      $lookup: { // Lookup
        from: 'mayoristas_tipos_ingresos',
        localField: 'tipo_ingreso',
        foreignField: '_id',
        as: 'tipo_ingreso'
      }
    }
    );

    pipelineIngresos.push({ $unwind: '$tipo_ingreso' });

    // Informacion de repartidor
    pipelineIngresos.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'repartidor',
        foreignField: '_id',
        as: 'repartidor'
      }
    }
    );

    pipelineIngresos.push({ $unwind: '$repartidor' });

    // Solo los pedidos completados o con deuda
    pipeline.push({ $match: { $or: [{ estado: 'Completado' }, { estado: 'Deuda' }] } });

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    // Ordenando cobros
    const ordenarCobros: any = {};
    if (columna) {
      ordenarCobros['createdAt'] = -1;
      pipelineCobros.push({ $sort: ordenar });
    }

    pipeline.push(
      {
        $group: {
          _id: null,
          cantidad_pedidos: { $sum: 1 },
          total_pedidos: { $sum: "$precio_total" },
          total_anticipos: { $sum: "$monto_anticipo" },
          total_cuentas_corrientes: { $sum: "$monto_cuenta_corriente" },
          total_recibido: { $sum: "$monto_recibido" },
          total_deuda: { $sum: "$deuda_monto" },
          // total_deuda2: { $sum: { $cond: [{ $eq: ["$comprobante", 'Fiscal'] }, "$precio_total", 0] } },
        }
      }
    )

    pipelineTotalGastos.push(
      {
        $group: {
          _id: null,
          total: { $sum: "$monto" },
          // total_deuda2: { $sum: { $cond: [{ $eq: ["$comprobante", 'Fiscal'] }, "$precio_total", 0] } },
        }
      }
    )

    
    pipelineTotalIngresos.push(
      {
        $group: {
          _id: null,
          total: { $sum: "$monto" },
          // total_deuda2: { $sum: { $cond: [{ $eq: ["$comprobante", 'Fiscal'] }, "$precio_total", 0] } },
        }
      }
    )

    const [datos, gastos, total_gastos, ingresos, total_ingresos, cobros] = await Promise.all([
      await this.ventasMayoristasModel.aggregate(pipeline),
      await this.gastosMayoristasModel.aggregate(pipelineGastos),
      await this.gastosMayoristasModel.aggregate(pipelineTotalGastos),
      await this.ingresosMayoristasModel.aggregate(pipelineIngresos),
      await this.ingresosMayoristasModel.aggregate(pipelineTotalIngresos),
      await this.cobrosModel.aggregate(pipelineCobros),
    ])

    let totalCobrosTMP = 0;

    // Total en cobros y anticipos
    cobros.map( cobro => {
      totalCobrosTMP += cobro.monto;
    })

    // AJUSTANDO VALORES

    const datosAD = datos[0] ? datos[0] : {
      _id: null,
      cantidad_pedidos: 0,
      total_pedidos: 0,
      total_anticipos: 0,
      total_cuentas_corrientes: 0,
      total_recibido: 0,
      total_deuda: 0,
    };

    const total_gastosAD = total_gastos[0] ? total_gastos[0].total : 0;
    const total_ingresosAD = total_ingresos[0] ? total_ingresos[0].total : 0;

    const total_recibidoAD = datosAD.total_recibido + 
                             datosAD.total_anticipos - 
                             datosAD.total_cuentas_corrientes - 
                             total_gastosAD + 
                             total_ingresosAD + 
                             totalCobrosTMP;

    return {
      datos: datosAD,
      gastos,
      ingresos,
      total_gastos: total_gastosAD,
      total_ingresos: total_ingresosAD + totalCobrosTMP,
      total_recibido: total_recibidoAD,
      cobros,
      total_cobros: totalCobrosTMP
    }

  }

  // Crear caja
  async crearCaja(cajasMayoristasDTO: CajasMayoristasDTO): Promise<ICajasMayoristas> {

    const nuevaCaja = new this.cajasMayoristasModel(cajasMayoristasDTO);
    
    const [caja] = await Promise.all([
      nuevaCaja.save(),
      this.ventasMayoristasModel.updateMany({
        $or:[{ estado:'Completado', activo: true }, { estado:'Deuda', activo: true }, { estado:'Cancelado', activo: true }]
      }, { activo: false }),
      // this.ventasMayoristasModel.updateMany({ estado:'Completado', activo: true }, { activo: false }),
      // this.ventasMayoristasModel.updateMany({ estado:'Deuda', activo: true }, { activo: false }),
      // this.ventasMayoristasModel.updateMany({ estado:'Cancelado', activo: true }, { activo: false }),
      this.ingresosMayoristasModel.updateMany({activo: true}, { activo: false }),
      this.gastosMayoristasModel.updateMany({activo: true}, { activo: false }),
      this.cobrosModel.updateMany({ activo: true}, { activo: false }),
    ])
    
    return caja;

  }

  // Actualizar caja
  async actualizarCaja(id: string, cajasMayoristasUpdateDTO: CajasMayoristasUpdateDTO): Promise<ICajasMayoristas> {
    const caja = await this.cajasMayoristasModel.findByIdAndUpdate(id, cajasMayoristasUpdateDTO, { new: true });
    return caja;
  }

  // Reporte de cajas
  async reporteCajas(data: any): Promise<any> {

    const { fechaDesde, fechaHasta } = data;

    const pipeline = [];

    // Filtro - Fecha desde
    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_caja: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });

    }

    // Filtro - Fecha hasta
    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_caja: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    pipeline.push({ $match: {} });

    pipeline.push({$group:{
      _id: null,
      cantidad_ventas: { $sum: "$cantidad_ventas" },
      total_ventas: { $sum: "$total_ventas" },
      total_anticipos: { $sum: "$total_anticipos" },
      total_cuentas_corrientes: { $sum: "$total_cuentas_corrientes" },
      total_deuda: { $sum: "$total_deuda" },
      monto_a_recibir: { $sum: "$monto_a_recibir" },
      total_otros_ingresos: { $sum: "$total_otros_ingresos" },
      total_otros_gastos: { $sum: "$total_otros_gastos" },
      total_recibido: { $sum: "$total_recibido" },
      total_recibido_real: { $sum: "$total_recibido_real" },
      monto_cintia: { $sum: "$monto_cintia" },
      diferencia: { $sum: "$diferencia" },
      total_final: { $sum: "$total_final" },
    }})

    const reportes = await this.cajasMayoristasModel.aggregate(pipeline);

    return reportes[0];

  }



}
