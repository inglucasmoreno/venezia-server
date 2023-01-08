import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model, Types } from 'mongoose';
import { IVentasMayoristas } from 'src/ventas-mayoristas/interface/ventas-mayoristas.interface';
import { PaquetesUpdateDTO } from './dto/paquetes-update.dto';
import { PaquetesDTO } from './dto/paquetes.dto';
import { IPaquetes } from './interface/paquetes.interface';

@Injectable()
export class PaquetesService {

    constructor(
        @InjectModel('Paquetes') private readonly paquetesModel: Model<IPaquetes>,
        @InjectModel('VentasMayoristas') private readonly ventasMayoristasModel: Model<IVentasMayoristas>,
    ) { }

    // Paquete por ID
    async getPaquete(id: string): Promise<IPaquetes> {

        const paqueteDB = await this.paquetesModel.findById(id);
        if (!paqueteDB) throw new NotFoundException('El paquete no existe');

        const pipeline = [];

        // Paquete por ID
        const idPaquete = new Types.ObjectId(id);
        pipeline.push({ $match: { _id: idPaquete } })

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

        const paquete = await this.paquetesModel.aggregate(pipeline);

        return paquete[0];

    }

    // Listar paquetes
    async listarPaquetes(querys: any): Promise<IPaquetes[]> {

        const { columna, direccion } = querys;

        const pipeline = [];
        pipeline.push({ $match: {} });

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

        const paquetes = await this.paquetesModel.aggregate(pipeline);

        return paquetes;

    }

    // Crear paquete
    async crearPaquete(paquetesDTO: PaquetesDTO): Promise<IPaquetes> {

        const { fecha_paquete, repartidor, creatorUser, updatorUser } = paquetesDTO;

        // Numero de paquete
        const ultimoPaquete: any = await this.paquetesModel.find()
                                                      .sort({ createdAt: -1 })
                                                      .limit(1)
        // Proximo numero de paquete
        let proximoNumeroPaquete = 0;
        if(ultimoPaquete[0]) proximoNumeroPaquete = ultimoPaquete[0].numero;
        proximoNumeroPaquete += 1;

        // Adaptacion de fecha de paquete
        const fechaAdp = add(new Date(fecha_paquete),{ hours: 3 });

        const data = {
            fecha_paquete: fechaAdp,
            numero: proximoNumeroPaquete,
            repartidor,
            creatorUser,
            updatorUser
        }

        console.log(data);

        // Creacion de paquete
        const paquete = new this.paquetesModel(data);
        return await paquete.save();

    }

    // Completar paquete
    async completarPaquete(data: any): Promise<IPaquetes> {

        const { paquete, fecha, precio_total } = data; 

        // Adaptando fecha
        const fechaAdp: any = add(new Date(fecha), { hours: 3 });

        // Cierre de pedidos
        await this.ventasMayoristasModel.updateMany({ paquete }, { fecha_pedido: fechaAdp, estado: 'Pendiente' });

        // Cierre de paquete
        const paqueteDB = await this.paquetesModel.findByIdAndUpdate(paquete, { fecha_paquete: fechaAdp, estado: 'Pendiente', precio_total });

        return paqueteDB;
    }

    // Actualizar paquete
    async actualizarPaquete(id: string, paquetesUpdateDTO: PaquetesUpdateDTO): Promise<IPaquetes> {
        const paquete = await this.paquetesModel.findByIdAndUpdate(id, paquetesUpdateDTO, { new: true });
        return paquete;
    }


}
