import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model, Types } from 'mongoose';
import { IVentasMayoristasProductos } from 'src/ventas-mayoristas-productos/interface/ventas-mayoristas-productos.interface';
import { IVentasMayoristas } from 'src/ventas-mayoristas/interface/ventas-mayoristas.interface';
import { PaquetesUpdateDTO } from './dto/paquetes-update.dto';
import { PaquetesDTO } from './dto/paquetes.dto';
import { IPaquetes } from './interface/paquetes.interface';

@Injectable()
export class PaquetesService {

    constructor(
        @InjectModel('Paquetes') private readonly paquetesModel: Model<IPaquetes>,
        @InjectModel('VentasMayoristas') private readonly ventasMayoristasModel: Model<IVentasMayoristas>,
        @InjectModel('VentasMayoristasProductos') private readonly ventasMayoristasProductosModel: Model<IVentasMayoristasProductos>,
    ) { }

    // Paquete por ID
    async getPaquete(id: string): Promise<IPaquetes> {

        const paqueteDB = await this.paquetesModel.findById(id);
        if (!paqueteDB) throw new NotFoundException('El paquete no existe');

        const pipeline = [];

        // Paquete por ID
        const idPaquete = new Types.ObjectId(id);
        pipeline.push({ $match: { _id: idPaquete } })

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
    async listarPaquetes(querys: any): Promise<any> {

        const {
            columna,
            direccion,
            repartidor,
            desde,
            registerpp,
            estado,
            parametro,
            fechaDesde,
            fechaHasta,
            activo
        } = querys;

        const pipeline = [];
        const pipelineTotal = [];

        pipeline.push({ $match: {} });
        pipelineTotal.push({ $match: {} });

        // Por repartidor
        if (repartidor && repartidor !== '') {
            const idRepartidor = new Types.ObjectId(repartidor);
            pipeline.push({ $match: { repartidor: idRepartidor } })
            pipelineTotal.push({ $match: { repartidor: idRepartidor } })
        }

        // Filtro - Activo / Inactivo
        let filtroActivo = {};
        if (activo && activo !== '') {
            filtroActivo = { activo: activo === 'true' ? true : false };
            pipeline.push({ $match: filtroActivo });
            pipelineTotal.push({ $match: filtroActivo });
        }

        // Filtro por estado
        if (estado && estado !== '') {
            pipeline.push({ $match: { estado } });
            pipelineTotal.push({ $match: { estado } });
        }

        // Filtro - Fecha desde
        if (fechaDesde && fechaDesde.trim() !== '') {
            pipeline.push({
                $match: {
                    fecha_paquete: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
                }
            });
            pipelineTotal.push({
                $match: {
                    fecha_paquete: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
                }
            });
        }

        // Filtro - Fecha hasta
        if (fechaHasta && fechaHasta.trim() !== '') {
            pipeline.push({
                $match: {
                    fecha_paquete: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
                }
            });
            pipelineTotal.push({
                $match: {
                    fecha_paquete: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
                }
            });
        }

        // Informacion - Repartidor
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

        // Informacion - Repartidor
        pipelineTotal.push({
            $lookup: { // Lookup
                from: 'usuarios',
                localField: 'repartidor',
                foreignField: '_id',
                as: 'repartidor'
            }
        }
        );

        pipelineTotal.push({ $unwind: '$repartidor' });

        // Filtro por parametros
        if (parametro && parametro !== '') {
            const regex = new RegExp(parametro, 'i');
            pipeline.push({ $match: { $or: [{ numero: Number(parametro) }] } });
            pipelineTotal.push({ $match: { $or: [{ numero: Number(parametro) }] } });
        }

        // Ordenando datos
        const ordenar: any = {};
        if (columna) {
            ordenar[String(columna)] = Number(direccion);
            pipeline.push({ $sort: ordenar });
        }

        // Paginacion
        pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

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

        const [paquetes, paquetesTotal] = await Promise.all([
            this.paquetesModel.aggregate(pipeline),
            this.paquetesModel.aggregate(pipelineTotal)
        ]);

        return {
            paquetes,
            totalItems: paquetesTotal.length
        };

    }

    // Enviar paquete
    async enviarPaquete(id: string, querys: any): Promise<any> {

        const { fecha } = querys;

        if (fecha !== '') {

            const adj_fecha: any = add(new Date(fecha), { hours: 3 });

            // Se actualiza el estado del paquete
            const paqueteDB = await this.paquetesModel.findByIdAndUpdate(id, { fecha_paquete: adj_fecha, estado: 'Enviado' }, { new: true });

            // Se actualiza el estado de los pedidos
            const pedidosDB = await this.ventasMayoristasModel.find({ paquete: paqueteDB._id });
            await this.ventasMayoristasModel.updateMany({ paquete: paqueteDB._id }, { fecha_pedido: adj_fecha, estado: 'Enviado' });

            // Se actualizan los productos
            pedidosDB.map(async pedido => {
                await this.ventasMayoristasProductosModel.updateMany({ ventas_mayorista: pedido._id }, { activo: false });
            })

        }else{

            const adj_fecha: any = add(new Date(fecha), { hours: 3 });

            // Se actualiza el estado del paquete
            const paqueteDB = await this.paquetesModel.findByIdAndUpdate(id, { estado: 'Enviado' }, { new: true });

            // Se actualiza el estado de los pedidos
            const pedidosDB = await this.ventasMayoristasModel.find({ paquete: paqueteDB._id });
            await this.ventasMayoristasModel.updateMany({ paquete: paqueteDB._id }, { estado: 'Enviado' });

            // Se actualizan los productos
            pedidosDB.map(async pedido => {
                await this.ventasMayoristasProductosModel.updateMany({ ventas_mayorista: pedido._id }, { activo: false });
            })

        }

        return 'Paquete enviado correctamente';

    }
    // Envio masivo de paquetes
    async envioMasivoPaquetes(querys: any): Promise<any> {

        const { fecha } = querys;

        const adj_fecha: any = add(new Date(fecha), { hours: 3 });

        console.log(adj_fecha);

        await Promise.all([
            this.paquetesModel.updateMany({ estado: 'Pendiente' }, { fecha_paquete: adj_fecha, estado: 'Enviado' }),
            this.ventasMayoristasModel.updateMany({ estado: 'Pendiente' }, { fecha_pedido: adj_fecha, estado: 'Enviado' }),
            this.ventasMayoristasProductosModel.updateMany({ activo: true }, { activo: false }),
        ])

        return 'Paquete enviado correctamente';

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
        if (ultimoPaquete[0]) proximoNumeroPaquete = ultimoPaquete[0].numero;
        proximoNumeroPaquete += 1;

        // Adaptacion de fecha de paquete
        const fechaAdp = add(new Date(fecha_paquete), { hours: 3 });

        const data = {
            fecha_paquete: fechaAdp,
            numero: proximoNumeroPaquete,
            repartidor,
            creatorUser,
            updatorUser
        }

        // Creacion de paquete
        const paquete = new this.paquetesModel(data);
        return await paquete.save();

    }

    // Completar paquete
    async completarPaquete(data: any): Promise<IPaquetes> {

        const { paquete, fecha, precio_total, cantidad_pedidos } = data;

        // Adaptando fecha
        const fechaAdp: any = add(new Date(fecha), { hours: 3 });

        // Cierre de pedidos
        await this.ventasMayoristasModel.updateMany({ paquete }, {
            fecha_pedido: fechaAdp,
            estado: 'Pendiente'
        });

        // Cierre de paquete
        const paqueteDB = await this.paquetesModel.findByIdAndUpdate(paquete, {
            fecha_paquete: fechaAdp,
            cantidad_pedidos,
            estado: 'Pendiente',
            precio_total
        });

        return paqueteDB;
    }

    // Actualizar paquete
    async actualizarPaquete(id: string, paquetesUpdateDTO: PaquetesUpdateDTO): Promise<IPaquetes> {
        
        const { fecha_paquete } = paquetesUpdateDTO;
        
        const adj_fecha = add(new Date(fecha_paquete), { hours: 3 });
        
        // Actualizacion de paquete
        paquetesUpdateDTO.fecha_paquete = adj_fecha;
        const paqueteDB = await this.paquetesModel.findByIdAndUpdate(id, paquetesUpdateDTO, { new: true });
        
        // Actualizacion de fecha en pedidos
        if(fecha_paquete && fecha_paquete !== '') await this.ventasMayoristasModel.updateMany({ paquete: paqueteDB._id }, { fecha_pedido: adj_fecha });    
        
        return paqueteDB;
    
    }

    // Eliminar paquete
    async eliminarPaquete(id: string): Promise<IPaquetes> {

        // Se elimina el paquete
        const paqueteDB = await this.paquetesModel.findByIdAndDelete(id);

        // Se obtienen los pedidos del paquete
        const pedidosDB: any = await this.ventasMayoristasModel.find({ paquete: id });

        // Se eliminan los pedido
        await this.ventasMayoristasModel.deleteMany({ paquete: paqueteDB._id }, { new: true });

        // Se eliminan los productos de los pedidos
        pedidosDB.map(async pedido => {
            await this.ventasMayoristasProductosModel.deleteMany({ ventas_mayorista: pedido._id });
        })

        return paqueteDB;
    }


}
