import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { AnyKeys, Model, Types } from 'mongoose';
import { ICobrosPedidos } from 'src/cobros-pedidos/inteface/cobros-pedidos.interface';
import { ICuentasCorrientesMayoristas } from 'src/cuentas-corrientes-mayoristas/interface/cuentas-corrientes-mayoristas.interface';
import { IUsuario } from 'src/usuarios/interface/usuarios.interface';
import { IVentasMayoristas } from 'src/ventas-mayoristas/interface/ventas-mayoristas.interface';
import { CobrosMayoristasUpdateDTO } from './dto/cobros-mayoristas-update.dto';
import { CobrosMayoristasDTO } from './dto/cobros-mayoristas.dto';
import { ICobrosMayoristas } from './interface/cobros-mayoristas.interface';

@Injectable()
export class CobrosMayoristasService {

  constructor(
    @InjectModel('CobrosMayoristas') private readonly cobrosModel: Model<ICobrosMayoristas>,
    @InjectModel('Usuarios') private readonly usuariosModel: Model<IUsuario>,
    @InjectModel('CobrosPedidos') private readonly cobrosPedidosModel: Model<ICobrosPedidos>,
    @InjectModel('VentasMayoristas') private readonly ventasMayoristasModel: Model<IVentasMayoristas>,
    @InjectModel('CuentasCorrientesMayoristas') private readonly cuentasCorrientesMayoristasModel: Model<ICuentasCorrientesMayoristas>,
  ) { }

  // Cobro por ID
  async getCobro(id: string): Promise<ICobrosMayoristas> {

    const cobroDB = await this.cobrosModel.findById(id);
    if (!cobroDB) throw new NotFoundException('El cobro no existe');

    const pipeline = [];

    // Cobro por ID
    const idCobro = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idCobro } })

    // Informacion de repartidor
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

    // Informacion de mayorista
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

    const cobros = await this.cobrosModel.aggregate(pipeline);

    return cobros[0];

  }

  // Listar cobros
  async listarCobros(querys: any): Promise<any> {

    const {
      columna,
      direccion,
      desde,
      registerpp,
      repartidor,
      mayorista,
      estado,
      tipo,
      parametro,
      fechaDesde,
      fechaHasta
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

    // Activo / Inactivo
    if (estado && estado !== '') {
      pipeline.push({ $match: { estado } });
      pipelineTotal.push({ $match: { estado } });
    }

    // Filtro - Tipo
    if (tipo && tipo !== '') {
      pipeline.push({ $match: { tipo } });
      pipelineTotal.push({ $match: { tipo } });
    }

    // Filtro por parametros
    if (parametro && parametro !== '') {
      pipeline.push({ $match: { $or: [{ nro: Number(parametro) }] } });
      pipelineTotal.push({ $match: { $or: [{ nro: Number(parametro) }] } });
    }


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

    // Informacion de repartidor
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

    // Informacion de mayorista
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

    // const cobros = await this.cobrosModel.aggregate(pipeline);

    const [cobros, cobrosTotal] = await Promise.all([
      this.cobrosModel.aggregate(pipeline),
      this.cobrosModel.aggregate(pipelineTotal)    
    ]);

    return {
      cobros,
      totalItems: cobrosTotal.length,
    };

  }

  // Crear cobro
  async crearCobro(cobrosDTO: CobrosMayoristasDTO): Promise<ICobrosMayoristas> {

    const { repartidor, pedidos, mayorista, monto } = cobrosDTO;

    console.log(cobrosDTO);

    // 1 - Calcular el proximo numero de pedido

    const ultimoCobro = await this.cobrosModel.find().sort({ createdAt: -1 }).limit(1);

    let proximoNumeroCobro = 1;
    if (ultimoCobro.length !== 0) proximoNumeroCobro = ultimoCobro[0].nro + 1;

    // 2 - Adaptacion -> Cobro en sucursal

    if (repartidor.trim() === '') { // El cobro se realiza en la sucursal
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
      cobrosDTO.repartidor = '000000000000000000000000';
    }

    const data = { ...cobrosDTO, nro: proximoNumeroCobro };

    // 3 - Generar cobro

    const nuevoCobro = new this.cobrosModel(data);
    const cobroDB = await nuevoCobro.save();

    // 4 - Relacionar pedidos con cobro y Actualizar el estado de los pedidos

    pedidos.map(async elemento => {

      // Generacion de relacion
      elemento.cobro = cobroDB._id;
      const nuevaRelacion = new this.cobrosPedidosModel(elemento)
      await nuevaRelacion.save()

      // Actualizacion de pedido

      const pedidoDB = await this.ventasMayoristasModel.findById(elemento.pedido);

      let dataPedido: any = {};
      if (elemento.cancelado) {
        dataPedido = {
          estado: 'Completado',
          deuda: false,
          monto_recibido: elemento.monto_total,
          deuda_monto: 0,
        }
      } else {
        dataPedido = {
          estado: 'Deuda',
          deuda: true,
          monto_recibido: pedidoDB.monto_recibido + elemento.monto_cobrado,
          deuda_monto: pedidoDB.deuda_monto - elemento.monto_cobrado,
        }
      }

      await this.ventasMayoristasModel.findByIdAndUpdate(elemento.pedido, dataPedido)

    });

    // Impacto sobre cuenta corriente
    const cuentaCorrienteDB = await this.cuentasCorrientesMayoristasModel.findOne({ mayorista });
    const nuevoSaldo = cuentaCorrienteDB.saldo + monto;

    await this.cuentasCorrientesMayoristasModel.findByIdAndUpdate(cuentaCorrienteDB._id, { saldo: nuevoSaldo });

    return cobroDB;

  }

  // Actualizar cobro
  async actualizarCobro(id: string, cobrosUpdateDTO: CobrosMayoristasUpdateDTO): Promise<ICobrosMayoristas> {
    const cobro = await this.cobrosModel.findByIdAndUpdate(id, cobrosUpdateDTO, { new: true });
    return cobro;
  }

}
