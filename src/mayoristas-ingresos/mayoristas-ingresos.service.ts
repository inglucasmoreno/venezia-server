import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model, Types } from 'mongoose';
import { IUsuario } from 'src/usuarios/interface/usuarios.interface';
import { MayoristasIngresosUpdateDTO } from './dto/mayoristas-ingresos-update.dto';
import { MayoristasIngresosDTO } from './dto/mayoristas-ingresos.dto';
import { IMayoristasIngresos } from './interface/mayoristas-ingresos.interface';

@Injectable()
export class MayoristasIngresosService {

  constructor(
    @InjectModel('Ingresos') private readonly ingresosModel: Model<IMayoristasIngresos>,
    @InjectModel('Usuario') private readonly usuariosModel: Model<IUsuario>,
  ) { }

  // Ingreso por ID
  async getIngreso(id: string): Promise<IMayoristasIngresos> {

    const ingresoDB = await this.ingresosModel.findById(id);
    if (!ingresoDB) throw new NotFoundException('El ingreso no existe');

    const pipeline = [];

    // Ingreso por ID
    const idIngreso = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idIngreso } })

    // Informacion de paquete
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

    // Informacion de tipo de ingresos
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas_tipos_ingresos',
        localField: 'tipo_ingreso',
        foreignField: '_id',
        as: 'tipo_ingreso'
      }
    }
    );

    pipeline.push({ $unwind: '$tipo_ingreso' });

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

    const ingreso = await this.ingresosModel.aggregate(pipeline);

    return ingreso[0];

  }

  // Listar ingresos
  async listarIngresos(querys: any): Promise<any> {

    const {
      columna,
      direccion,
      desde,
      registerpp,
      fechaDesde,
      fechaHasta,
      activo,
      repartidor,
      tipo_ingreso
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];
    const pipelineCalculo = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({ $match: {} });
    pipelineCalculo.push({ $match: {} });

    // Filtro - Por repartidor
    if (repartidor && repartidor.trim() !== '') {
      const idRepartidor = new Types.ObjectId(repartidor);
      pipeline.push({ $match: { repartidor: idRepartidor } });
      pipelineTotal.push({ $match: { repartidor: idRepartidor } });
      pipelineCalculo.push({ $match: { repartidor: idRepartidor } });
    }

    // Filtro - Por tipo de ingreso
    if (tipo_ingreso && tipo_ingreso.trim() !== '') {
      const idTipoIngreso = new Types.ObjectId(tipo_ingreso);
      pipeline.push({ $match: { tipo_ingreso: idTipoIngreso } });
      pipelineTotal.push({ $match: { tipo_ingreso: idTipoIngreso } });
      pipelineCalculo.push({ $match: { tipo_ingreso: idTipoIngreso } });
    }

    // Filtro - Activo / Inactivo
    let filtroActivo = {};
    if (activo && activo !== '') {
      filtroActivo = { activo: activo === 'true' ? true : false };
      pipeline.push({ $match: filtroActivo });
      pipelineTotal.push({ $match: filtroActivo });
      pipelineCalculo.push({ $match: filtroActivo });
    }

    // Filtro - Fecha desde
    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_ingreso: { $gte: add(new Date(fechaDesde), { hours: 0 }) }
        }
      });
      pipelineTotal.push({
        $match: {
          fecha_ingreso: { $gte: add(new Date(fechaDesde), { hours: 0 }) }
        }
      });
      pipelineCalculo.push({
        $match: {
          fecha_ingreso: { $gte: add(new Date(fechaDesde), { hours: 0 }) }
        }
      });
    }

    // Filtro - Fecha hasta
    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_ingreso: { $lte: add(new Date(fechaHasta), { days: 1, hours: 0 }) }
        }
      });
      pipelineTotal.push({
        $match: {
          fecha_ingreso: { $lte: add(new Date(fechaHasta), { days: 1, hours: 0 }) }
        }
      });
      pipelineCalculo.push({
        $match: {
          fecha_ingreso: { $lte: add(new Date(fechaHasta), { days: 1, hours: 0 }) }
        }
      });
    }

    // Informacion de paquete
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

    // Informacion de tipo de ingresos
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas_tipos_ingresos',
        localField: 'tipo_ingreso',
        foreignField: '_id',
        as: 'tipo_ingreso'
      }
    }
    );

    pipeline.push({ $unwind: '$tipo_ingreso' });

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
    pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

    // Calculo total en ingresos
    pipelineCalculo.push({
      $group: {
        _id: null,
        montoTotal: { $sum: "$monto" },
      }
    })

    const [ingresos, totalIngresos, calculos] = await Promise.all([
      this.ingresosModel.aggregate(pipeline),
      this.ingresosModel.aggregate(pipelineTotal),
      this.ingresosModel.aggregate(pipelineCalculo),
    ])

    return {
      ingresos,
      totalItems: totalIngresos.length,
      montoTotal: calculos[0] ? calculos[0].montoTotal : 0
    };

  }

  // Crear ingreso
  async crearIngreso(ingresosDTO: MayoristasIngresosDTO): Promise<IMayoristasIngresos> {
    
    const { fecha_ingreso, paquete, tipo_ingreso } = ingresosDTO;
    
    const adj_fecha: any = add(new Date(fecha_ingreso), { hours: 3 });

    ingresosDTO.fecha_ingreso = adj_fecha;
    
    // Verificacion: Ingreso ya cargado
    const repetido = await this.ingresosModel.find({ paquete, tipo_ingreso });
    if(repetido.length > 0) throw new NotFoundException('El ingreso ya se encuentra cargado');

    const nuevoIngreso = new this.ingresosModel(ingresosDTO);
    const ingresoDB = await nuevoIngreso.save();

    return await this.getIngreso(ingresoDB._id);
  
  }

  // Actualizar ingreso
  async actualizarIngreso(id: string, ingresosUpdateDTO: MayoristasIngresosUpdateDTO): Promise<IMayoristasIngresos> {
    const ingreso = await this.ingresosModel.findByIdAndUpdate(id, ingresosUpdateDTO, { new: true });
    return ingreso;
  }

  // Eliminar ingreso
  async eliminarIngreso(id: string): Promise<IMayoristasIngresos> {
    const ingreso = await this.ingresosModel.findByIdAndDelete(id);
    return ingreso;
  }

}
