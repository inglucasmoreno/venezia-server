import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model, Types } from 'mongoose';
import { IUsuario } from 'src/usuarios/interface/usuarios.interface';
import { MayoristasGastosUpdateDTO } from './dto/mayoristas-gastos-update.dto';
import { MayoristasGastosDTO } from './dto/mayoristas-gastos.dto';
import { IMayoristasGastos } from './interface/mayoristas-gastos.interface';

@Injectable()
export class MayoristasGastosService {

  constructor(
    @InjectModel('Gastos') private readonly gastosModel: Model<IMayoristasGastos>,
    @InjectModel('Usuario') private readonly usuariosModel: Model<IUsuario>,
  ) { }

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
        fecha_gasto: { $gte: add(new Date(fechaDesde),{ hours: 3 })} 
      }});
      pipelineTotal.push({$match: { 
        fecha_gasto: { $gte: add(new Date(fechaDesde),{ hours: 3 })} 
      }});
      pipelineCalculo.push({$match: { 
        fecha_gasto: { $gte: add(new Date(fechaDesde),{ hours: 3 })} 
      }});
    }
    
    // Filtro - Fecha hasta
    if(fechaHasta && fechaHasta.trim() !== ''){
      pipeline.push({$match: { 
        fecha_gasto: { $lte: add(new Date(fechaHasta),{ days: 1, hours: 3 })} 
      }});
      pipelineTotal.push({$match: { 
        fecha_gasto: { $lte: add(new Date(fechaHasta),{ days: 1, hours: 3 })} 
      }});
      pipelineCalculo.push({$match: { 
        fecha_gasto: { $lte: add(new Date(fechaHasta),{ days: 1, hours: 3 })} 
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

    const { repartidor } = gastosDTO;

    if (repartidor.trim() === '000000000000000000000000') { // El cobro se realiza en la sucursal
      const sucursal = await this.usuariosModel.findById('000000000000000000000000');
      if (!sucursal) {
        const dataSucursal = {
          _id: '000000000000000000000000',
          usuario: 'sucursal',
          dni: '0000000000000000',
          apellido: 'sucursal',
          nombre: 'sucursal',
          password: '00000000000000',
          email: 'sucursal@gmail.com',
          role: 'DELIVERY_ROLE',
          permisos: [],
          activo: false
        }
        const usuarioSucursal = new this.usuariosModel(dataSucursal);
        await usuarioSucursal.save();
      }
      gastosDTO.repartidor = '000000000000000000000000';
    }

    const nuevoGasto = new this.gastosModel(gastosDTO);
    return await nuevoGasto.save();
  }

  // Actualizar gasto
  async actualizarGasto(id: string, gastosUpdateDTO: MayoristasGastosUpdateDTO): Promise<IMayoristasGastos> {
    const gasto = await this.gastosModel.findByIdAndUpdate(id, gastosUpdateDTO, { new: true });
    return gasto;
  }

  // Eliminar gasto
  async eliminarGasto(id: string): Promise<IMayoristasGastos> {
    const gasto = await this.gastosModel.findByIdAndDelete(id);
    return gasto;
  }

}
