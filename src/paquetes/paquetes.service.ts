import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model, Types } from 'mongoose';
import { ICobrosMayoristas } from 'src/cobros-mayoristas/interface/cobros-mayoristas.interface';
import { ICobrosPedidos } from 'src/cobros-pedidos/inteface/cobros-pedidos.interface';
import { ICuentasCorrientesMayoristas } from 'src/cuentas-corrientes-mayoristas/interface/cuentas-corrientes-mayoristas.interface';
import { IMayoristasGastos } from 'src/mayoristas-gastos/interface/mayoristas-gastos.interface';
import { IMayoristasIngresos } from 'src/mayoristas-ingresos/interface/mayoristas-ingresos.interface';
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
        @InjectModel('MayoristasGastos') private readonly mayoristasGastosModel: Model<IMayoristasGastos>,
        @InjectModel('MayoristasIngresos') private readonly mayoristasIngresosModel: Model<IMayoristasIngresos>,
        @InjectModel('CuentasCorrientesMayoristas') private readonly cuentasCorrientesMayoristasModel: Model<ICuentasCorrientesMayoristas>,
        @InjectModel('CobrosMayoristas') private readonly cobrosMayoristasModel: Model<ICobrosMayoristas>,
        @InjectModel('CobrosPedidos') private readonly cobrosPedidosModel: Model<ICobrosPedidos>,
    ) { }

    // Paquete por ID
    async getPaquete(id: string): Promise<any> {

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

        const pipelineGastos = [];
        const pipelineIngresos = [];

        pipelineGastos.push({ $match: { paquete: idPaquete } });
        pipelineIngresos.push({ $match: { paquete: idPaquete } });

        // Informacion de tipo de gasto
        pipelineGastos.push({
            $lookup: { // Lookup
                from: 'mayoristas_tipos_gastos',
                localField: 'tipo_gasto',
                foreignField: '_id',
                as: 'tipo_gasto'
            }
        }
        );

        pipelineGastos.push({ $unwind: '$tipo_gasto' });

        // Informacion de tipo de ingreso
        pipelineIngresos.push({
            $lookup: { // Lookup
                from: 'mayoristas_tipos_ingresos',
                localField: 'tipo_ingreso',
                foreignField: '_id',
                as: 'tipo_ingreso'
            }
        }
        );

        pipelineIngresos.push({ $unwind: '$tipo_ingreso' });


        // Cobros
        const pipelineCobros = [];
        pipelineCobros.push({ $match: { paquete: idPaquete } });

        // Informacion de mayorista
        pipelineCobros.push({
            $lookup: { // Lookup
                from: 'mayoristas',
                localField: 'mayorista',
                foreignField: '_id',
                as: 'mayorista'
            }
        }
        );

        pipelineCobros.push({ $unwind: '$mayorista' });

        const [paquete, gastos, ingresos, cobros] = await Promise.all([
            this.paquetesModel.aggregate(pipeline),
            this.mayoristasGastosModel.aggregate(pipelineGastos),
            this.mayoristasIngresosModel.aggregate(pipelineIngresos),
            this.cobrosMayoristasModel.aggregate(pipelineCobros),
        ]);

        return {
            paquete: paquete[0],
            gastos,
            ingresos,
            cobros
        };

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
        const pipelineTotales = [];

        pipeline.push({ $match: {} });
        pipelineTotal.push({ $match: {} });
        pipelineTotales.push({ $match: {} });

        // Por repartidor
        if (repartidor && repartidor !== '') {
            const idRepartidor = new Types.ObjectId(repartidor);
            pipeline.push({ $match: { repartidor: idRepartidor } })
            pipelineTotal.push({ $match: { repartidor: idRepartidor } })
            pipelineTotales.push({ $match: { repartidor: idRepartidor } })
        }

        // Filtro - Activo / Inactivo
        let filtroActivo = {};
        if (activo && activo !== '') {
            filtroActivo = { activo: activo === 'true' ? true : false };
            pipeline.push({ $match: filtroActivo });
            pipelineTotal.push({ $match: filtroActivo });
            pipelineTotales.push({ $match: filtroActivo });
        }

        // Filtro por estado
        if (estado && estado !== '') {
            pipeline.push({ $match: { estado } });
            pipelineTotal.push({ $match: { estado } });
            pipelineTotales.push({ $match: { estado } });
        }

        // Filtro - Fecha desde
        if (fechaDesde && fechaDesde.trim() !== '') {
            pipeline.push({
                $match: {
                    fecha_paquete: { $gte: add(new Date(fechaDesde), { hours: 0 }) }
                }
            });
            pipelineTotal.push({
                $match: {
                    fecha_paquete: { $gte: add(new Date(fechaDesde), { hours: 0 }) }
                }
            });
            pipelineTotales.push({
                $match: {
                    fecha_paquete: { $gte: add(new Date(fechaDesde), { hours: 0 }) }
                }
            });
        }

        // Filtro - Fecha hasta
        if (fechaHasta && fechaHasta.trim() !== '') {
            pipeline.push({
                $match: {
                    fecha_paquete: { $lte: add(new Date(fechaHasta), { days: 1, hours: 0 }) }
                }
            });
            pipelineTotal.push({
                $match: {
                    fecha_paquete: { $lte: add(new Date(fechaHasta), { days: 1, hours: 0 }) }
                }
            });
            pipelineTotales.push({
                $match: {
                    fecha_paquete: { $lte: add(new Date(fechaHasta), { days: 1, hours: 0 }) }
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
            pipelineTotales.push({ $match: { $or: [{ numero: Number(parametro) }] } });
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

        pipelineTotales.push({
            $group: {
              _id: 'Totales',
              precio_total: { $sum: "$precio_total" },              
              total_deuda: { $sum: "$total_deuda" },
              total_recibir: { $sum: "$total_recibir" },
            }
          })

        const [paquetes, paquetesTotal, totales] = await Promise.all([
            this.paquetesModel.aggregate(pipeline),
            this.paquetesModel.aggregate(pipelineTotal),
            this.paquetesModel.aggregate(pipelineTotales),
        ]);

        return {
            paquetes,
            totalItems: paquetesTotal.length,
            totales: totales[0]
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

        } else {

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

    // Crear paquete
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

    // Cerrar paquete
    async cerrarPaquete(id: string, data: any): Promise<any> {

        const { dataPaquete, pedidos } = data;
        const { fecha_paquete } = dataPaquete;
 
        // Adaptando fecha
        const adj_fecha = add(new Date(fecha_paquete), { hours: 3 });
        dataPaquete.fecha_paquete = adj_fecha;

        // Cierre del paquete
        const paqueteDB = await this.paquetesModel.findByIdAndUpdate(id, dataPaquete, { new: true });

        // Actualizacion de fecha en -> Pedidos, Gastos e Ingresos del paquete
        if (fecha_paquete && fecha_paquete !== '') {

            await Promise.all([
                this.ventasMayoristasModel.updateMany({ paquete: paqueteDB._id }, { fecha_pedido: adj_fecha }),
                this.mayoristasIngresosModel.updateMany({ paquete: paqueteDB._id }, { fecha_ingreso: adj_fecha }),
                this.mayoristasGastosModel.updateMany({ paquete: paqueteDB._id }, { fecha_gasto: adj_fecha }),
                this.cobrosMayoristasModel.updateMany({ paquete: paqueteDB._id }, { fecha_cobro: adj_fecha }),
            ])

        }

        // Actualizacion de pedidos
        pedidos.map( async pedido => {

            const dataPedido = {
                fecha_pedido: adj_fecha,
                deuda: pedido.deuda,
                estado: pedido.estado,
                deuda_monto: pedido.deuda_monto,
                monto_recibido: pedido.monto_recibido,
                monto_anticipo: pedido.monto_anticipo,
                monto_cuenta_corriente: pedido.monto_cuenta_corriente,          
            }

            await this.ventasMayoristasModel.findByIdAndUpdate(pedido._id, dataPedido);    

            // Impacto en cuenta corriente
    
            const cuentaCorrienteDB = await this.cuentasCorrientesMayoristasModel.findOne({ mayorista: pedido.mayorista._id });

            let nuevoSaldo = 0;

            if(pedido.deuda_monto > 0) nuevoSaldo = cuentaCorrienteDB.saldo - pedido.deuda_monto;
            else if(pedido.monto_anticipo > 0) nuevoSaldo = cuentaCorrienteDB.saldo + pedido.monto_anticipo;
            
            await this.cuentasCorrientesMayoristasModel.findByIdAndUpdate(cuentaCorrienteDB._id, { saldo: nuevoSaldo });

        })

        // Impacto de los cobros del paquete
        const cobros = await this.cobrosMayoristasModel.find({ paquete: id });

        cobros.map( async cobro => {

            // Impacto en cuenta corriente
            const cuentaCorrienteDB = await this.cuentasCorrientesMayoristasModel.findOne({ mayorista: String(cobro.mayorista) });
            const nuevoSaldo = cuentaCorrienteDB.saldo + cobro.monto_total_recibido;

            await this.cuentasCorrientesMayoristasModel.findByIdAndUpdate(cuentaCorrienteDB._id, { saldo: nuevoSaldo });

        })

        // Actualizacion de pedidos
        const relaciones = await this.cobrosPedidosModel.find({ paquete_cobro: id });

        // Actualizacion de pedidos
        for(const relacion of relaciones){
            
            // Datos actuales de el pedido
            const pedidoDB = await this.ventasMayoristasModel.findById(relacion.pedido);

            const dataPedido = {
                estado: relacion.cancelado ? 'Completado' : 'Deuda',
                deuda: !relacion.cancelado,
                monto_recibido: pedidoDB.monto_recibido + relacion.monto_cobrado,
                deuda_monto: pedidoDB.deuda_monto - relacion.monto_cobrado,       
            }

            await this.ventasMayoristasModel.findByIdAndUpdate(relacion.pedido, dataPedido);

            const paqueteDB = await this.paquetesModel.findById(relacion.paquete_pedido);

            const dataPaquete = {
                total_deuda: paqueteDB.total_deuda - relacion.monto_cobrado,
                total_parcial: paqueteDB.total_parcial + relacion.monto_cobrado,
                estado: (paqueteDB.total_deuda - relacion.monto_cobrado) === 0 ? 'Completado' : 'Deuda',
                // total_cobros: paqueteDB.total_cobros + relacion.monto_cobrado,
                total_recibir: paqueteDB.total_recibir + relacion.monto_cobrado
            }

            await this.paquetesModel.findByIdAndUpdate(paqueteDB._id, dataPaquete);

        }
        
        return paqueteDB;

    }

    // Actualizar paquete
    async actualizarPaquete(id: string, paquetesUpdateDTO: PaquetesUpdateDTO): Promise<IPaquetes> {

        const { fecha_paquete } = paquetesUpdateDTO;

        const adj_fecha = add(new Date(fecha_paquete), { hours: 3 });

        // Actualizacion de paquete
        paquetesUpdateDTO.fecha_paquete = adj_fecha;
        const paqueteDB = await this.paquetesModel.findByIdAndUpdate(id, paquetesUpdateDTO, { new: true });

        // Actualizacion de fecha en -> Pedidos, Gastos e Ingresos del paquete
        if (fecha_paquete && fecha_paquete !== '') {

            await Promise.all([
                this.ventasMayoristasModel.updateMany({ paquete: paqueteDB._id }, { fecha_pedido: adj_fecha }),
                this.mayoristasIngresosModel.updateMany({ paquete: paqueteDB._id }, { fecha_ingreso: adj_fecha }),
                this.mayoristasGastosModel.updateMany({ paquete: paqueteDB._id }, { fecha_gasto: adj_fecha }),
                this.cobrosMayoristasModel.updateMany({ paquete: paqueteDB._id }, { fecha_cobro: adj_fecha }),
            ])

        }

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

        // Se eliminan los gastos e ingresos del paquete
        await Promise.all([
            this.mayoristasGastosModel.deleteMany({ paquete: id }),
            this.mayoristasIngresosModel.deleteMany({ paquete: id }),
            this.cobrosMayoristasModel.deleteMany({ paquete: id }),
            this.cobrosPedidosModel.deleteMany({ paquete: id })
        ])

        return paqueteDB;
    }


}
