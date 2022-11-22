import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IMayoristas } from 'src/mayoristas/interface/mayoristas.interface';
import { CuentasCorrientesMayoristasUpdateDTO } from './dto/cuentas-corrientes-mayoristas-update.dto';
import { CuentasCorrientesMayoristasDTO } from './dto/cuentas-corrientes-mayoristas.dto';
import { ICuentasCorrientesMayoristas } from './interface/cuentas-corrientes-mayoristas.interface';

@Injectable()
export class CuentasCorrientesMayoristasService {

  constructor(
    @InjectModel('Mayoristas') private readonly mayoristasModel: Model<IMayoristas>,
    @InjectModel('CuentasCorrientesMayoristas') private readonly cuentasCorrientesModel: Model<ICuentasCorrientesMayoristas>,
  ) { }

  // Cuenta corriente por ID
  async getCuentaCorriente(id: string): Promise<ICuentasCorrientesMayoristas> {

    const cuentaCorrienteDB = await this.cuentasCorrientesModel.findById(id);
    if (!cuentaCorrienteDB) throw new NotFoundException('La cuenta corriente no existe');

    const pipeline = [];

    // Cuenta corriente por ID
    const idCuentaCorriente = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idCuentaCorriente } })

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

    const cuentaCorriente = await this.cuentasCorrientesModel.aggregate(pipeline);

    return cuentaCorriente[0];

  }

  // Inicializar cuentas corrientes
  async inicializarCuentasCorrientes(querys: any): Promise<any> {

    const { creatorUser } = querys;

    const mayoristas = await this.mayoristasModel.find();

    mayoristas.map( async mayorista => {
      const cuentaDB = await this.cuentasCorrientesModel.findOne({ mayorista: mayorista._id});
      if(!cuentaDB){
        const data = {
          mayorista: mayorista._id,
          saldo: 0,
          creatorUser,
          updatorUser: creatorUser
        }
        const nuevaCuenta = new this.cuentasCorrientesModel(data);
        await nuevaCuenta.save();
      }
    })

    return 'Inicializacion correcta';
  
  }

  // Listar mayoristas
  async listarCuentasCorrientes(querys: any): Promise<ICuentasCorrientesMayoristas[]> {

    const { columna, direccion } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

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

    const cuentas_corrientes = await this.cuentasCorrientesModel.aggregate(pipeline);

    return cuentas_corrientes;

  }

  // Crear cuenta corriente
  async crearCuentaCorriente(cuentasCorrientesDTO: CuentasCorrientesMayoristasDTO): Promise<ICuentasCorrientesMayoristas> {
    const nuevaCuentaCorriente = new this.cuentasCorrientesModel(cuentasCorrientesDTO);
    return await nuevaCuentaCorriente.save();
  }

  // Actualizar cuenta corriente
  async actualizarCuentaCorriente(id: string, cuentasCorrientesUpdateDTO: CuentasCorrientesMayoristasUpdateDTO): Promise<ICuentasCorrientesMayoristas> {
    const cuenta_corriente = await this.cuentasCorrientesModel.findByIdAndUpdate(id, cuentasCorrientesUpdateDTO, { new: true });
    return cuenta_corriente;
  }


}
