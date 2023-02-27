import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IClientes } from './interface/clientes.interface';

@Injectable()
export class ClientesService {

  constructor(
    @InjectModel('Clientes') private readonly clientesModel: Model<IClientes>,
  ) { }

  // Cliente por ID
  async getCliente(id: string): Promise<IClientes> {

    const clienteDB = await this.clientesModel.findById(id);
    if(!clienteDB) throw new NotFoundException('La cliente no existe');

    const pipeline = [];

    // Cliente por ID
    const idCliente = new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idCliente} }) 

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
          from: 'usuarios',
          localField: 'creatorUser',
          foreignField: '_id',
          as: 'creatorUser'
      }}
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
          from: 'usuarios',
          localField: 'updatorUser',
          foreignField: '_id',
          as: 'updatorUser'
      }}
    );

    pipeline.push({ $unwind: '$updatorUser' });

    const cliente = await this.clientesModel.aggregate(pipeline);
    
    return cliente[0];
  }

  // Cliente por identificacion
  async getClientePorIdentificacion(identificacion: string): Promise<IClientes> {
    const cliente = await this.clientesModel.findOne({ identificacion });
    return cliente;
  }

  // Crear cliente
  async crearCliente(clienteDTO: any): Promise<IClientes> {

    const { identificacion } = clienteDTO;

    // Verificamos que el cliente no esta repetido
    let clienteDB = await this.getClientePorIdentificacion(identificacion);
    if (clienteDB) throw new NotFoundException('El cliente ya se encuentra registrado');

    // Creacion de cliente
    const nuevoCliente = new this.clientesModel(clienteDTO);
    const cliente = await nuevoCliente.save();

    return cliente;

  }

  // Listar clientes
  async listarClientes(querys: any): Promise<any> {

    const {
      columna,
      direccion,
      desde,
      registerpp,
      parametro,
      activo
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({ $match: {} });

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
          from: 'usuarios',
          localField: 'creatorUser',
          foreignField: '_id',
          as: 'creatorUser'
      }}
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
          from: 'usuarios',
          localField: 'updatorUser',
          foreignField: '_id',
          as: 'updatorUser'
      }}
    );

    pipeline.push({ $unwind: '$updatorUser' });

    // Filtro - Activo / Inactivo
    let filtroActivo = {};
    if (activo && activo !== '') {
      filtroActivo = { activo: activo === 'true' ? true : false };
      pipeline.push({ $match: filtroActivo });
      pipelineTotal.push({ $match: filtroActivo });
    }

    // Filtro por parametros
    if (parametro && parametro !== '') {
      const regex = new RegExp(parametro, 'i');
      pipeline.push({ $match: { $or: [{ descripcion: regex }, { identificacion: regex }] } });
      pipelineTotal.push({ $match: { $or: [{ descripcion: regex }, { identificacion: regex }] } });
    }

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    // Paginacion
    pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

    const [clientes, clientesTotal] = await Promise.all([
      this.clientesModel.aggregate(pipeline),
      this.clientesModel.aggregate(pipelineTotal)
    ]);

    return {
      clientes,
      totalItems: clientesTotal.length
    };

  }


  // Actualizar cliente
  async actualizarCliente(id: string, clientesUpdateDTO: any): Promise<IClientes> {

    const { identificacion } = clientesUpdateDTO;

    // Se verifica si el cliente a actualizar existe
    let clienteDB = await this.getCliente(id);
    if (!clienteDB) throw new NotFoundException('El cliente no existe');

    // Verificamos que el cliente no este repetido
    if (identificacion && clienteDB.identificacion !== identificacion) {
      const clienteDBIdentificacion = await this.getClientePorIdentificacion(identificacion);
      if (clienteDBIdentificacion) throw new NotFoundException('El cliente ya esta registrado');
    }

    const clienteRes = await this.clientesModel.findByIdAndUpdate(id, clientesUpdateDTO, { new: true });
    return clienteRes;

  }

}
