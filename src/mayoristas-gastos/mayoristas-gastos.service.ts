import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model, Types } from 'mongoose';
import { MayoristasGastosUpdateDTO } from './dto/mayoristas-gastos-update.dto';
import { MayoristasGastosDTO } from './dto/mayoristas-gastos.dto';
import { IMayoristasGastos } from './interface/mayoristas-gastos.interface';

@Injectable()
export class MayoristasGastosService {


  constructor(@InjectModel('Gastos') private readonly gastosModel: Model<IMayoristasGastos>) { }

  // Gasto por ID
  async getGasto(id: string): Promise<IMayoristasGastos> {

    const gastoDB = await this.gastosModel.findById(id);
    if (!gastoDB) throw new NotFoundException('El gasto no existe');

    const pipeline = [];

    // Gasto por ID
    const idGasto = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idGasto } })

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas_tipos_gastos',
        localField: 'tipo_gasto',
        foreignField: '_id',
        as: 'tipo_gasto'
      }
    }
    );

    pipeline.push({ $unwind: '$tipo_gasto' });

    // Informacion de usuario creador
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

    const gasto = await this.gastosModel.aggregate(pipeline);

    return gasto[0];

  }

  // Listar gastos
  async listarGastos(querys: any): Promise<any> {

    const { 
      columna, 
      direccion,
      desde,
      registerpp, 
      fechaDesde, 
      fechaHasta,
      activo,
      repartidor,
      tipo_gasto
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];
    const pipelineCalculo = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({$match:{}});
    pipelineCalculo.push({$match:{}});

    // Filtro - Por repartidor
    if(repartidor && repartidor.trim() !== ''){
      const idRepartidor = new Types.ObjectId(repartidor);
      pipeline.push({ $match: { repartidor: idRepartidor } });
      pipelineTotal.push({ $match: { repartidor: idRepartidor } });
      pipelineCalculo.push({ $match: { repartidor: idRepartidor } });
    }

    // Filtro - Por tipo de gasto
    if(tipo_gasto && tipo_gasto.trim() !== ''){
      const idTipoGasto = new Types.ObjectId(tipo_gasto);
      pipeline.push({ $match: { tipo_gasto: idTipoGasto } });
      pipelineTotal.push({ $match: { tipo_gasto: idTipoGasto } });
      pipelineCalculo.push({ $match: { tipo_gasto: idTipoGasto } });
    }

    // Filtro - Activo / Inactivo
    let filtroActivo = {};
    if(activo && activo !== '') {
      filtroActivo = { activo: activo === 'true' ? true : false };
      pipeline.push({$match: filtroActivo});
      pipelineTotal.push({$match: filtroActivo});
      pipelineCalculo.push({$match: filtroActivo});
    }

    // Filtro - Fecha desde
    if(fechaDesde && fechaDesde.trim() !== ''){
      pipeline.push({$match: { 
        createdAt: { $gte: add(new Date(fechaDesde),{ hours: 3 })} 
      }});
      pipelineTotal.push({$match: { 
        createdAt: { $gte: add(new Date(fechaDesde),{ hours: 3 })} 
      }});
      pipelineCalculo.push({$match: { 
        createdAt: { $gte: add(new Date(fechaDesde),{ hours: 3 })} 
      }});
    }
    
    // Filtro - Fecha hasta
    if(fechaHasta && fechaHasta.trim() !== ''){
      pipeline.push({$match: { 
        createdAt: { $lte: add(new Date(fechaHasta),{ days: 1, hours: 3 })} 
      }});
      pipelineTotal.push({$match: { 
        createdAt: { $lte: add(new Date(fechaHasta),{ days: 1, hours: 3 })} 
      }});
      pipelineCalculo.push({$match: { 
        createdAt: { $lte: add(new Date(fechaHasta),{ days: 1, hours: 3 })} 
      }});
    }

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas_tipos_gastos',
        localField: 'tipo_gasto',
        foreignField: '_id',
        as: 'tipo_gasto'
      }
    }
    );

    pipeline.push({ $unwind: '$tipo_gasto' });

    // Informacion de usuario creador
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

    // Paginacion
    pipeline.push({$skip: Number(desde)}, {$limit: Number(registerpp)});

    // Calculo total en gastos
    pipelineCalculo.push({$group:{
      _id: null,
      montoTotal: { $sum: "$monto" },
    }})

    const [gastos, totalGastos, calculos] = await Promise.all([
      this.gastosModel.aggregate(pipeline),
      this.gastosModel.aggregate(pipelineTotal),
      this.gastosModel.aggregate(pipelineCalculo),
    ]) 

    return {
      gastos,
      totalItems: totalGastos.length,
      montoTotal: calculos[0] ? calculos[0].montoTotal : 0
    };

  }

  // Crear gasto
  async crearGasto(gastosDTO: MayoristasGastosDTO): Promise<IMayoristasGastos> {
    const nuevoGasto = new this.gastosModel(gastosDTO);
    return await nuevoGasto.save();
  }

  // Actualizar gasto
  async actualizarGasto(id: string, gastosUpdateDTO: MayoristasGastosUpdateDTO): Promise<IMayoristasGastos> {
    const gasto = await this.gastosModel.findByIdAndUpdate(id, gastosUpdateDTO, { new: true });
    return gasto;
  }

}
