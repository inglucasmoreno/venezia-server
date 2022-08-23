import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MayoristasUpdateDTO } from './dto/mayoristas-update.dto';
import { IMayoristas } from './interface/mayoristas.interface';

@Injectable()
export class MayoristasService {
  constructor(@InjectModel('Mayoristas') private readonly mayoristasModel: Model<IMayoristas>){}
    
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

      const { email } = mayoristaUpdateDTO;

      // Se verifica si el mayorista a actualizar existe
      let mayoristaDB = await this.getMayorista(id);
      if(!mayoristaDB) throw new NotFoundException('El mayorista no existe');
      
      // Verificamos que el email no este repetido
      if(email && mayoristaDB.email !== email){
          const mayoristaDBEmail = await this.getMayoristaPorEmail(email);
          if(mayoristaDBEmail) throw new NotFoundException('El mayorista ya esta registrado');
      }

      const mayoristaRes = await this.mayoristasModel.findByIdAndUpdate(id, mayoristaUpdateDTO, {new: true});
      return mayoristaRes;
      
  }

}
