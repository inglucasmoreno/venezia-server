import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { pipe } from 'rxjs';
import { ICuentasCorrientesMayoristas } from 'src/cuentas-corrientes-mayoristas/interface/cuentas-corrientes-mayoristas.interface';
import { pipeline } from 'stream';
import { MayoristasUpdateDTO } from './dto/mayoristas-update.dto';
import { MayoristasDTO } from './dto/mayoristas.dto';
import { IMayoristas } from './interface/mayoristas.interface';

@Injectable()
export class MayoristasService {
    constructor(
        @InjectModel('Mayoristas') private readonly mayoristasModel: Model<IMayoristas>,
        @InjectModel('CuentasCorrientes') private readonly cuentasCorrientesModel: Model<ICuentasCorrientesMayoristas>
    ) { }

    // Mayorista por ID
    async getMayorista(id: string): Promise<IMayoristas> {
        const mayorista = await this.mayoristasModel.findById(id);
        if (!mayorista) throw new NotFoundException('El mayorista no existe');
        return mayorista;
    }

    // Mayorista por email
    async getMayoristaPorEmail(email: string): Promise<IMayoristas> {
        const mayorista = await this.mayoristasModel.findOne({ email });
        return mayorista;
    }

    // Crear mayorista
    async crearMayorista(mayoristaDTO: any): Promise<IMayoristas> {

        const { email, descripcion, creatorUser } = mayoristaDTO;

        // Verificacion: descripcion repetida
        if (descripcion) {
            const mayoristaDescripcion = await this.mayoristasModel.findOne({ descripcion: descripcion.trim().toUpperCase() })
            if (mayoristaDescripcion) throw new NotFoundException('El mayorista ya se encuentra cargado');
        }

        // Verificamos que el mayorista no esta repetido
        let mayoristaDB = await this.getMayoristaPorEmail(email);
        if (mayoristaDB) throw new NotFoundException('El email ya se encuentra registrado');

        // Creacion de usuario
        const nuevoMayorista = new this.mayoristasModel(mayoristaDTO);
        const mayorista = await nuevoMayorista.save();

        // Se crea su cuenta corriente
        const data = {
            mayorista: mayorista._id,
            saldo: 0,
            creatorUser,
            updatorUser: creatorUser
        }

        const nuevaCuenta = new this.cuentasCorrientesModel(data);
        await nuevaCuenta.save();

        return mayorista;

    }

    // Listar mayoristas
    async listarMayoristas(querys: any): Promise<IMayoristas[]> {

        const { columna, direccion } = querys;

        // Ordenar
        let ordenar = [columna || 'descripcion', direccion || 1];

        const mayoristas = await this.mayoristasModel.find().sort([ordenar]);
        return mayoristas;
    }

    // Listar mayoristas con CC
    async listarMayoristasConCC(querys: any): Promise<any> {

        const {
            columna,
            direccion,
            desde,
            registerpp,
            parametro,
            activo,
            estado
        } = querys;

        const pipeline = [];
        const pipelineTotal = [];

        pipeline.push({ $match: {} });
        pipelineTotal.push({ $match: {} });

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
            pipeline.push({ $match: { $or: [{ descripcion: regex }] } });
            pipelineTotal.push({ $match: { $or: [{ descripcion: regex }] } });
        }

        // Ordenando datos
        const ordenar: any = {};
        if (columna) {
            ordenar[String(columna)] = Number(direccion);
            pipeline.push({ $sort: ordenar });
        }

        // Paginacion
        pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

        const [mayoristas, mayoristasTotal] = await Promise.all([
            this.mayoristasModel.aggregate(pipeline),
            this.mayoristasModel.aggregate(pipelineTotal)
        ]);
        
        // Se agrega valores de cuenta corriente
        const cuentas_corrientes = await this.cuentasCorrientesModel.find();

        mayoristas.map(mayorista => {
            mayorista.cuenta_corriente = cuentas_corrientes.find((cc: any) => {
                return String(mayorista._id) === String(cc.mayorista);
            });
        })

        let mayoristasTMP = [];

        // Filtrado por estado
        if(estado === 'deuda'){
            mayoristasTMP = mayoristas.filter( elemento => elemento.cuenta_corriente.saldo < 0 );
        }else if(estado === 'favor'){
            mayoristasTMP = mayoristas.filter( elemento => elemento.cuenta_corriente.saldo > 0 );
        }else{
            mayoristasTMP = mayoristas;
        }

        return {
            mayoristas: mayoristasTMP,
            totalItems: mayoristasTotal.length
        };
    
    }

    // Actualizar mayorista
    async actualizarMayorista(id: string, mayoristaUpdateDTO: MayoristasUpdateDTO): Promise<IMayoristas> {

        const { email, descripcion } = mayoristaUpdateDTO;

        // Se verifica si el mayorista a actualizar existe
        let mayoristaDB = await this.getMayorista(id);
        if (!mayoristaDB) throw new NotFoundException('El mayorista no existe');

        // Verificacion: descripcion repetida
        if (descripcion) {
            const mayoristaDescripcion = await this.mayoristasModel.findOne({ descripcion: descripcion.trim().toUpperCase() })
            if (mayoristaDescripcion && mayoristaDescripcion._id.toString() !== id) throw new NotFoundException('El mayorista ya se encuentra cargado');
        }

        // Verificamos que el email no este repetido
        if (email && mayoristaDB.email !== email) {
            const mayoristaDBEmail = await this.getMayoristaPorEmail(email);
            if (mayoristaDBEmail) throw new NotFoundException('El mayorista ya esta registrado');
        }

        const mayoristaRes = await this.mayoristasModel.findByIdAndUpdate(id, mayoristaUpdateDTO, { new: true });
        return mayoristaRes;

    }

}

