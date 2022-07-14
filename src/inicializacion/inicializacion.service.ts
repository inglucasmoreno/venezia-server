import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { IUsuario } from 'src/usuarios/interface/usuarios.interface';
import { IProducto } from 'src/productos/interface/productos.interface';

import fetch from 'node-fetch';

@Injectable()
export class InicializacionService {
    
    constructor(
        @InjectModel('Usuario') private readonly usuarioModel: Model<IUsuario>,
        @InjectModel('UnidadMedida') private readonly unidadMedidaModel: Model<IProducto>
    ){}

    async initUsuarios(): Promise<any> {
       
        // const body = {
        //     username: 'munsldatos',
        //     password: 'G6uBBH2FF0o472001o2e'
        // }

        // console.log(JSON.stringify(body));

        var details = {
            'username': 'munsldatos',
            'password': 'G6uBBH2FF0o472001o2e',
        };
        
        var formBody:any = [];
        for (var property in details) {
          var encodedKey = encodeURIComponent(property);
          var encodedValue = encodeURIComponent(details[property]);
          formBody.push(encodedKey + "=" + encodedValue);
        }
        
        formBody = formBody.join("&");

        console.log(formBody)

        const respuesta = await fetch("https://apirenaper.idear.gov.ar/CHUTROFINAL/API_ABIS/Autorizacion/token.php",{
            method: 'POST',
            body: formBody,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}
        })

        const data = await respuesta.json();

        console.log(data);

        // // 1) - Verificacion
        // const verificacion = await this.usuarioModel.find();
        // if(verificacion.length != 0) throw new NotFoundException('Los usuarios ya fueron inicializados');

        // // 2) - Se crea usuario administrador
        // const data: any = {
        //     usuario: 'admin',
        //     apellido: 'Admin',
        //     nombre: 'Admin',
        //     dni: '34060399',
        //     email: 'admin@gmail.com',
        //     role: 'ADMIN_ROLE',
        //     activo: true
        // }
    
        // // Generacion de password encriptado
        // const salt = bcryptjs.genSaltSync();
        // data.password = bcryptjs.hashSync('admin', salt);
    
        // // Se crea y se almacena en la base de datos al usuario administrador
        // const usuario = new this.usuarioModel(data);
        // await usuario.save();


        // // 3) - Inicializar unidades de medida

        // // 1 - UNIDAD: 000000000000000000000000
        // const unidad = new this.unidadMedidaModel({
        //     _id: '000000000000000000000000',
        //     descripcion: 'UNIDAD',
        //     creatorUser: usuario._id,
        //     updatorUser: usuario._id
        // });

        // await unidad.save();

        // // 2 - KILOGRAMO: 111111111111111111111111
        // const kilogramo = new this.unidadMedidaModel({
        //     _id: '111111111111111111111111',
        //     descripcion: 'KILOGRAMO',
        //     creatorUser: usuario._id,
        //     updatorUser: usuario._id
        // });

        // await kilogramo.save();


    
    }

}
