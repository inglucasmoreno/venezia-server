import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { IUsuario } from 'src/usuarios/interface/usuarios.interface';
import { IProducto } from 'src/productos/interface/productos.interface';
import { ISaldoInicial } from 'src/cajas/interface/saldo-inicial.interface';
import { IRepartidores } from 'src/repartidores/interface/repartidores.interface';
import * as XLSX from 'xlsx';

@Injectable()
export class InicializacionService {
    
    constructor(
        @InjectModel('Usuario') private readonly usuarioModel: Model<IUsuario>,
        @InjectModel('SaldoInicial') private readonly saldoInicialModel: Model<ISaldoInicial>,
        @InjectModel('UnidadMedida') private readonly unidadMedidaModel: Model<IProducto>,
        @InjectModel('Repartidores') private readonly repartidoresModel: Model<IRepartidores>,
        @InjectModel('Productos') private readonly productosModel: Model<IProducto>,
    ){}

    async initUsuarios(): Promise<any> {

        // 1) - Verificacion
        const verificacion = await this.usuarioModel.find();
        if(verificacion.length != 0) throw new NotFoundException('El sistema ya fue inicializado');

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

        // 4) - Inicializacion de saldo inicial de caja
        const saldoInicial = new this.saldoInicialModel({
            _id: '222222222222222222222222',
            monto: 0,
            creatorUser: usuario._id,
            updatorUser: usuario._id           
        })

        await saldoInicial.save();

        // 5) - Inicializacion de repartidor - "Sin repartidor"
        const repartidor = new this.repartidoresModel({
            _id: '333333333333333333333333',
            descripcion: 'Sin repartidor',
            creatorUser: usuario._id,
            updatorUser: usuario._id           
        })

        await repartidor.save();
        
    }

     // Se importan los productos desde un documento de excel
     async importarProductos(query: any): Promise<any> {

        const { usuario } = query;
        
        const workbook = XLSX.readFile('./importar/productos.xlsx');
        const workbookSheets = workbook.SheetNames;
        const sheet = workbookSheets[0];
        const dataExcel: any = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

        // Verificacion de formato excel
        const condicion = dataExcel.length > 0 &&
                          dataExcel[0].DESCRIPCION &&
                          dataExcel[0].PRECIO &&
                          dataExcel[0].BALANZA

        if(!condicion) throw new NotFoundException('Excel con formato incorrecto');

        let registrosCargados = 0;

        for(const productoRec of dataExcel){

            let producto: any = productoRec;

            if(producto.DESCRIPCION && producto.BALANZA){
                
                const data = {
                    codigo: '',
                    descripcion: producto.DESCRIPCION,
                    precio: producto.PRECIO ? producto.PRECIO : 0,
                    unidad_medida: producto.BALANZA === 'NO' ? '000000000000000000000000' : '111111111111111111111111',
                    balanza: producto.BALANZA === 'SI' ? true : false,
                    creatorUser: usuario,
                    updatorUser: usuario
                }
    
                const productoDB = await this.productosModel.findOne({ descripcion: data.descripcion });
                if(!productoDB){
                    registrosCargados += 1;
                    const nuevoProducto = new this.productosModel(data);
                    await nuevoProducto.save();        
                }

            }

        }              

        if(registrosCargados === 0){
            return 'La base de productos ya se encuentra actualizada';
        }else{
            return `Cantidad de registros cargados: ${registrosCargados}`
        }

    }

}
