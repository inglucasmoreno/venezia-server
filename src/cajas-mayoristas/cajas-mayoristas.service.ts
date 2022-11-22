import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
  async listarCajas(querys: any): Promise<ICajasMayoristas[]> {

    const { columna, direccion } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

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

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    const cajas = await this.cajasMayoristasModel.aggregate(pipeline);

    return cajas;

  }

  // Calculos iniciales
  async calculosIniciales(querys: any): Promise<any> {

    const { columna, direccion, repartidor } = querys;

    const pipeline = [];
    const pipelineGastos = [];
    const pipelineTotalGastos = [];
    const pipelineIngresos = [];
    const pipelineTotalIngresos = [];

    // Solo los activos
    pipeline.push({ $match: { activo: true } });
    pipelineGastos.push({ $match: { activo: true } });
    pipelineTotalGastos.push({ $match: { activo: true } });
    pipelineIngresos.push({ $match: { activo: true } });
    pipelineTotalIngresos.push({ $match: { activo: true } });

    // Solo de un repartidor en particular
    if (repartidor && repartidor !== '') {
      const idRepartidor = new Types.ObjectId(repartidor);
      pipeline.push({ $match: { repartidor: idRepartidor } });
      pipelineGastos.push({ $match: { repartidor: idRepartidor } });
      pipelineTotalGastos.push({ $match: { repartidor: idRepartidor } });
      pipelineIngresos.push({ $match: { repartidor: idRepartidor } });
      pipelineTotalIngresos.push({ $match: { repartidor: idRepartidor } });
    }

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

    pipeline.push(
      {
        $group: {
          _id: null,
          cantidad_pedidos: { $sum: 1 },
          total_pedidos: { $sum: "$precio_total" },
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

    const [datos, gastos, total_gastos, ingresos, total_ingresos] = await Promise.all([
      await this.ventasMayoristasModel.aggregate(pipeline),
      await this.gastosMayoristasModel.aggregate(pipelineGastos),
      await this.gastosMayoristasModel.aggregate(pipelineTotalGastos),
      await this.ingresosMayoristasModel.aggregate(pipelineIngresos),
      await this.ingresosMayoristasModel.aggregate(pipelineTotalIngresos),
    ])

    // AJUSTANDO VALORES

    const datosAD = datos[0] ? datos[0] : {
      _id: null,
      cantidad_pedidos: 0,
      total_pedidos: 0,
      total_recibido: 0,
      total_deuda: 0,
    };

    const total_gastosAD = total_gastos[0] ? total_gastos[0].total : 0;
    const total_ingresosAD = total_ingresos[0] ? total_ingresos[0].total : 0;

    const total_recibidoAD = datosAD.total_recibido - total_gastosAD + total_ingresosAD;

    return {
      datos: datosAD,
      gastos,
      ingresos,
      total_gastos: total_gastosAD,
      total_ingresos: total_ingresosAD,
      total_recibido: total_recibidoAD
    }


  }

  // Crear caja
  async crearCaja(cajasMayoristasDTO: CajasMayoristasDTO): Promise<ICajasMayoristas> {
    const nuevaCaja = new this.cajasMayoristasModel(cajasMayoristasDTO);
    return await nuevaCaja.save();
  }

  // Actualizar caja
  async actualizarCaja(id: string, cajasMayoristasUpdateDTO: CajasMayoristasUpdateDTO): Promise<ICajasMayoristas> {
    const caja = await this.cajasMayoristasModel.findByIdAndUpdate(id, cajasMayoristasUpdateDTO, { new: true });
    return caja;
  }
}