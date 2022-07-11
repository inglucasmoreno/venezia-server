import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { IUsuario } from 'src/usuarios/interface/usuarios.interface';
import { IProducto } from 'src/productos/interface/productos.interface';

@Injectable()
export class InicializacionService {
    
    constructor(
        @InjectModel('Usuario') private readonly usuarioModel: Model<IUsuario>,
        @InjectModel('UnidadMedida') private readonly unidadMedidaModel: Model<IProducto>
    ){}

    async initUsuarios(): Promise<any> {
        
        // 1) - Verificacion
        const verificacion = await this.usuarioModel.find();
        if(verificacion.length != 0) throw new NotFoundException('Los usuarios ya fueron inicializados');

        // 2) - Se crea usuario administrador
        const data: any = {
            usuario: 'admin',
            apellido: 'Admin',
            nombre: 'Admin',
            dni: '34060399',
            email: 'admin@gmail.com',
            role: 'ADMIN_ROLE',
            activo: true
        }
    
        // Generacion de password encriptado
        const salt = bcryptjs.genSaltSync();
        data.password = bcryptjs.hashSync('admin', salt);
    
        // Se crea y se almacena en la base de datos al usuario administrador
        const usuario = new this.usuarioModel(data);
        await usuario.save();


        // 3) - Inicializar unidades de medida

        // 1 - UNIDAD: 000000000000000000000000
        const unidad = new this.unidadMedidaModel({
            _id: '000000000000000000000000',
            descripcion: 'UNIDAD',
            creatorUser: usuario._id,
            updatorUser: usuario._id
        });

        await unidad.save();

        // 2 - KILOGRAMO: 111111111111111111111111
        const kilogramo = new this.unidadMedidaModel({
            _id: '111111111111111111111111',
            descripcion: 'KILOGRAMO',
            creatorUser: usuario._id,
            updatorUser: usuario._id
        });

        await kilogramo.save();
    
    }

}
