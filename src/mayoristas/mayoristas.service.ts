import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICuentasCorrientesMayoristas } from 'src/cuentas-corrientes-mayoristas/interface/cuentas-corrientes-mayoristas.interface';
import { MayoristasUpdateDTO } from './dto/mayoristas-update.dto';
import { MayoristasDTO } from './dto/mayoristas.dto';
import { IMayoristas } from './interface/mayoristas.interface';

@Injectable()
export class MayoristasService {
  constructor(
    @InjectModel('Mayoristas') private readonly mayoristasModel: Model<IMayoristas>,
    @InjectModel('CuentasCorrientes') private readonly cuentasCorrientesModel: Model<ICuentasCorrientesMayoristas>
    ){}
    
    // Mayorista por ID
    async getMayorista(id: string): Promise<IMayoristas> {
        const mayorista = await this.mayoristasModel.findById(id);
        if(!mayorista) throw new NotFoundException('El mayorista no existe');
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
        if(descripcion){
            const mayoristaDescripcion = await this.mayoristasModel.findOne({descripcion: descripcion.trim().toUpperCase()})
            if(mayoristaDescripcion) throw new NotFoundException('El mayorista ya se encuentra cargado');
        }

        // Verificamos que el mayorista no esta repetido
        let mayoristaDB = await this.getMayoristaPorEmail(email);
        if(mayoristaDB) throw new NotFoundException('El email ya se encuentra registrado');

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
        
        const {columna, direccion} = querys;

        // Ordenar
        let ordenar = [columna || 'descripcion', direccion || 1];

        const mayoristas = await this.mayoristasModel.find().sort([ordenar]);
        return mayoristas;
    }  

    // Actualizar mayorista
    async actualizarMayorista(id: string, mayoristaUpdateDTO: MayoristasUpdateDTO): Promise<IMayoristas> {

        const { email, descripcion } = mayoristaUpdateDTO;

        // Se verifica si el mayorista a actualizar existe
        let mayoristaDB = await this.getMayorista(id);
        if(!mayoristaDB) throw new NotFoundException('El mayorista no existe');
        
        // Verificacion: descripcion repetida
        if(descripcion){
            const mayoristaDescripcion = await this.mayoristasModel.findOne({descripcion: descripcion.trim().toUpperCase()})
            if(mayoristaDescripcion && mayoristaDescripcion._id.toString() !== id) throw new NotFoundException('El mayorista ya se encuentra cargado');
        }

        // Verificamos que el email no este repetido
        if(email && mayoristaDB.email !== email){
            const mayoristaDBEmail = await this.getMayoristaPorEmail(email);
            if(mayoristaDBEmail) throw new NotFoundException('El mayorista ya esta registrado');
        }

        const mayoristaRes = await this.mayoristasModel.findByIdAndUpdate(id, mayoristaUpdateDTO, {new: true});
        return mayoristaRes;
        
    }

}

