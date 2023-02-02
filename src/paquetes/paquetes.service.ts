import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add, format } from 'date-fns';
import { Model, Types } from 'mongoose';
import * as fs from 'fs';
import * as pdf from 'pdf-creator-node';
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

        // Relacion cobros-pedidos
        const pipelineCobroPedido = []
        pipelineCobroPedido.push({ $match: { paquete_pedido: idPaquete } });

        // Informacion de mayorista
        pipelineCobroPedido.push({
            $lookup: { // Lookup
                from: 'mayoristas',
                localField: 'mayorista',
                foreignField: '_id',
                as: 'mayorista'
            }
        }
        );


        pipelineCobroPedido.push({ $unwind: '$mayorista' });

        // Informacion de cobro
        pipelineCobroPedido.push({
            $lookup: { // Lookup
                from: 'cobros_mayoristas',
                localField: 'cobro',
                foreignField: '_id',
                as: 'cobro'
            }
        }
        );

        pipelineCobroPedido.push({ $unwind: '$cobro' });

        // Informacion de pedido
        pipelineCobroPedido.push({
            $lookup: { // Lookup
                from: 'ventas_mayoristas',
                localField: 'pedido',
                foreignField: '_id',
                as: 'pedido'
            }
        }
        );

        pipelineCobroPedido.push({ $unwind: '$pedido' });

        // Informacion de paquete_cobro
        pipelineCobroPedido.push({
            $lookup: { // Lookup
                from: 'paquetes',
                localField: 'paquete_cobro',
                foreignField: '_id',
                as: 'paquete_cobro'
            }
        }
        );

        pipelineCobroPedido.push({ $unwind: '$paquete_cobro' });

        // Ordenando datos
        const ordenarGastos: any = {};
        ordenarGastos['fecha_gasto'] = -1;
        const ordenarIngresos: any = {};
        ordenarIngresos['fecha_ingreso'] = -1;
        const ordenarCobros: any = {};
        ordenarCobros['fecha_cobro'] = -1;
        const ordenarCobrosPedidos: any = {};
        ordenarCobrosPedidos['cobro.fecha_cobro'] = -1;

        pipelineGastos.push({ $sort: ordenarGastos });
        pipelineIngresos.push({ $sort: ordenarIngresos });
        pipelineCobros.push({ $sort: ordenarCobros });
        pipelineCobroPedido.push({ $sort: ordenarCobrosPedidos });

        const [paquete, gastos, ingresos, cobros, cobros_externos] = await Promise.all([
            this.paquetesModel.aggregate(pipeline),
            this.mayoristasGastosModel.aggregate(pipelineGastos),
            this.mayoristasIngresosModel.aggregate(pipelineIngresos),
            this.cobrosMayoristasModel.aggregate(pipelineCobros),
            this.cobrosPedidosModel.aggregate(pipelineCobroPedido)
        ]);

        return {
            paquete: paquete[0],
            gastos,
            ingresos,
            cobros,
            cobros_externos
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
        pedidos.map(async pedido => {

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

            let nuevoSaldo = cuentaCorrienteDB.saldo;

            if (pedido.deuda_monto > 0) nuevoSaldo -= pedido.deuda_monto;
            if (pedido.monto_anticipo > 0) nuevoSaldo += pedido.monto_anticipo;
            if (pedido.monto_cuenta_corriente > 0) nuevoSaldo -= pedido.monto_cuenta_corriente;

            await this.cuentasCorrientesMayoristasModel.findByIdAndUpdate(cuentaCorrienteDB._id, { saldo: nuevoSaldo });

        })

        // Impacto de los cobros del paquete
        const cobros = await this.cobrosMayoristasModel.find({ paquete: id });

        for (const cobro of cobros) {

            // Impacto en cuenta corriente
            const cuentaCorrienteDB = await this.cuentasCorrientesMayoristasModel.findOne({ mayorista: cobro.mayorista });
            const nuevoSaldo = cuentaCorrienteDB.saldo + cobro.monto_total_recibido;

            await this.cuentasCorrientesMayoristasModel.findByIdAndUpdate(cuentaCorrienteDB._id, { saldo: nuevoSaldo });

        }

        // Actualizacion de pedidos
        const relaciones = await this.cobrosPedidosModel.find({ paquete_cobro: id });

        // Actualizacion de pedidos
        for (const relacion of relaciones) {

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
            this.cobrosPedidosModel.deleteMany({ paquete_cobro: id })
        ])

        return paqueteDB;
    }

    // Reporte general
    async reporteGeneral(querys: any): Promise<any> {

        const { fechaDesde, fechaHasta, repartidor } = querys;

        const pipeline = [];
        const pipelinePedidos = [];
        const pipelineGastos = [];
        const pipelineIngresos = [];
        const pipelineTotalPorRepartidor = [];
        const pipelineGastosPorRepartidor = [];
        const pipelineIngresosPorRepartidor = [];

        pipeline.push({ $match: {} });
        pipelinePedidos.push({ $match: {} });
        pipelineGastos.push({ $match: {} });
        pipelineIngresos.push({ $match: {} });
        pipelineTotalPorRepartidor.push({ $match: {} });
        pipelineGastosPorRepartidor.push({ $match: {} });
        pipelineIngresosPorRepartidor.push({ $match: {} });


        // Por repartidor
        if (repartidor && repartidor !== '') {
            const idRepartidor = new Types.ObjectId(repartidor);
            pipeline.push({ $match: { repartidor: idRepartidor } });
            pipelinePedidos.push({ $match: { repartidor: idRepartidor } });
        }

        // Filtro - Fecha desde
        if (fechaDesde && fechaDesde.trim() !== '') {
            pipeline.push({
                $match: {
                    fecha_paquete: { $gte: add(new Date(fechaDesde), { hours: 0 }) }
                }
            });
            pipelinePedidos.push({
                $match: {
                    fecha_pedido: { $gte: add(new Date(fechaDesde), { hours: 0 }) }
                }
            });
            pipelineGastos.push({
                $match: {
                    fecha_gasto: { $gte: add(new Date(fechaDesde), { hours: 0 }) }
                }
            });
            pipelineIngresos.push({
                $match: {
                    fecha_ingreso: { $gte: add(new Date(fechaDesde), { hours: 0 }) }
                }
            });
            pipelineTotalPorRepartidor.push({
                $match: {
                    fecha_paquete: { $gte: add(new Date(fechaDesde), { hours: 0 }) }
                }
            });
            pipelineGastosPorRepartidor.push({
                $match: {
                    fecha_gasto: { $gte: add(new Date(fechaDesde), { hours: 0 }) }
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
            pipelinePedidos.push({
                $match: {
                    fecha_pedido: { $lte: add(new Date(fechaHasta), { days: 1, hours: 0 }) }
                }
            });
            pipelineGastos.push({
                $match: {
                    fecha_gasto: { $lte: add(new Date(fechaHasta), { days: 1, hours: 0 }) }
                }
            });
            pipelineIngresos.push({
                $match: {
                    fecha_ingreso: { $lte: add(new Date(fechaHasta), { days: 1, hours: 0 }) }
                }
            });
            pipelineTotalPorRepartidor.push({
                $match: {
                    fecha_paquete: { $lte: add(new Date(fechaHasta), { days: 1, hours: 0 }) }
                }
            });
            pipelineIngresosPorRepartidor.push({
                $match: {
                    fecha_ingreso: { $lte: add(new Date(fechaHasta), { days: 1, hours: 0 }) }
                }
            });
        }

        // Informacion - Repartidor
        pipelineTotalPorRepartidor.push({
            $lookup: { // Lookup
                from: 'usuarios',
                localField: 'repartidor',
                foreignField: '_id',
                as: 'repartidor'
            }
        }
        );

        pipelineTotalPorRepartidor.push({ $unwind: '$repartidor' });

        // Informacion - Repartidor
        pipelineGastosPorRepartidor.push({
            $lookup: { // Lookup
                from: 'usuarios',
                localField: 'repartidor',
                foreignField: '_id',
                as: 'repartidor'
            }
        }
        );

        pipelineGastosPorRepartidor.push({ $unwind: '$repartidor' });

        // Informacion - Repartidor
        pipelineIngresosPorRepartidor.push({
            $lookup: { // Lookup
                from: 'usuarios',
                localField: 'repartidor',
                foreignField: '_id',
                as: 'repartidor'
            }
        }
        );

        pipelineIngresosPorRepartidor.push({ $unwind: '$repartidor' });

        // Informacion - Tipo de gasto
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

        // Informacion - Tipo de gasto
        pipelineGastosPorRepartidor.push({
            $lookup: { // Lookup
                from: 'mayoristas_tipos_gastos',
                localField: 'tipo_gasto',
                foreignField: '_id',
                as: 'tipo_gasto'
            }
        }
        );

        pipelineGastosPorRepartidor.push({ $unwind: '$tipo_gasto' });

        // Informacion - Tipo de ingreso
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

        // Informacion - Tipo de ingreso
        pipelineIngresosPorRepartidor.push({
            $lookup: { // Lookup
                from: 'mayoristas_tipos_ingresos',
                localField: 'tipo_ingreso',
                foreignField: '_id',
                as: 'tipo_ingreso'
            }
        }
        );

        pipelineIngresosPorRepartidor.push({ $unwind: '$tipo_ingreso' });

        // Paquetes
        pipeline.push({
            $group: {
                _id: 'Totales-Paquetes',
                precio_total: { $sum: "$precio_total" },
                total_deudas: { $sum: "$total_deuda" },
                cantidad_paquetes: { $sum: 1 },
            }
        })

        // Pedidos
        pipelinePedidos.push({
            $group: {
                _id: 'Totales-Pedidos',
                cantidad_pedidos: { $sum: 1 },
            }
        })

        // Gastos
        pipelineGastos.push({
            $group: {
                _id: '$tipo_gasto.descripcion',
                total: { $sum: "$monto" }
            }
        })

        // Ingresos
        pipelineIngresos.push({
            $group: {
                _id: '$tipo_ingreso.descripcion',
                total: { $sum: "$monto" }
            }
        })

        // Total por repartidor
        pipelineTotalPorRepartidor.push({
            $group: {
                _id: {
                    repartidor: '$repartidor._id',
                    repartidor_apellido: '$repartidor.apellido',
                    repartidor_nombre: '$repartidor.nombre',
                },
                precio_total: { $sum: "$precio_total" },
                deuda_total: { $sum: "$total_deuda" },
            }
        })

        // Gastos por repartidor
        pipelineGastosPorRepartidor.push({
            $group: {
                _id: {
                    repartidor: '$repartidor._id',
                    repartidor_apellido: '$repartidor.apellido',
                    repartidor_nombre: '$repartidor.nombre',
                    tipo_gasto: '$tipo_gasto.descripcion'
                },
                monto: { $sum: "$monto" },
            }
        })

        // Ingresos por repartidor
        pipelineIngresosPorRepartidor.push({
            $group: {
                _id: {
                    repartidor: '$repartidor._id',
                    repartidor_apellido: '$repartidor.apellido',
                    repartidor_nombre: '$repartidor.nombre',
                    tipo_ingreso: '$tipo_ingreso.descripcion'
                },
                monto: { $sum: "$monto" },
            }
        })

        // Ordenando datos - Gastos
        pipelineGastos.push({
            $sort: {
                '_id.tipo_gasto.descripcion': 1,
            }
        });

        // Ordenando datos - Ingresos
        pipelineIngresos.push({
            $sort: {
                '_id.tipo_ingreso.descripcion': 1,
            }
        });


        // Ordenando datos - Gastos por repartidor
        pipelineGastosPorRepartidor.push({
            $sort: {
                '_id.repartidor_apellido': 1,
                '_id.tipo_gasto.descripcion': 1,
            }
        });

        // Ordenando datos - Ingresos por repartidor
        pipelineIngresosPorRepartidor.push({
            $sort: {
                '_id.repartidor_apellido': 1,
                '_id.tipo_ingreso.descripcion': 1,
            }
        });


        const [totales, totalesPedidos, gastos, ingresos, totalPorRepartidor, gastosPorRepartidor, ingresosPorRepartidor] = await Promise.all([
            this.paquetesModel.aggregate(pipeline),
            this.ventasMayoristasModel.aggregate(pipelinePedidos),
            this.mayoristasGastosModel.aggregate(pipelineGastos),
            this.mayoristasIngresosModel.aggregate(pipelineIngresos),
            this.paquetesModel.aggregate(pipelineTotalPorRepartidor),
            this.mayoristasGastosModel.aggregate(pipelineGastosPorRepartidor),
            this.mayoristasIngresosModel.aggregate(pipelineIngresosPorRepartidor),
        ])

        // Calculo de total gastos
        let totalGastosTMP = 0
        gastos.map(gasto => {
            totalGastosTMP += gasto.total;
        });

        // Calculo de total ingresos
        let totalIngresosTMP = 0
        ingresos.map(ingreso => {
            totalIngresosTMP += ingreso.total;
        });

        // Armando DATA de Repartidor
        let dataRepartidores = [];

        totalPorRepartidor.map( total => {
            dataRepartidores.push({
                repartidor_id: String(total._id.repartidor),
                repartidor_descripcion: total._id.repartidor_apellido + ' ' + total._id.repartidor_nombre,
                ganancia: total.precio_total - total.deuda_total
            })
        });

        dataRepartidores.map( repartidor => {

            repartidor.gastos = [];
            repartidor.ingresos = [];
            repartidor.total_gastos = 0;
            repartidor.total_ingresos = 0;

            // Gastos por repartidor
            gastosPorRepartidor.map( (gasto: any) => {

                if(String(gasto._id.repartidor) === repartidor.repartidor_id){
                    repartidor.total_gastos += gasto.monto;
                    repartidor.gastos.push({
                        tipo_gasto: gasto._id.tipo_gasto,
                        total: gasto.monto    
                    })
                }

            }) 

            // Ingresos por repartidor
            ingresosPorRepartidor.map( (ingreso: any) => {

                if(String(ingreso._id.repartidor) === repartidor.repartidor_id){
                    repartidor.total_ingresos += ingreso.monto;
                    repartidor.ingresos.push({
                        tipo_ingreso: ingreso._id.tipo_ingreso,
                        total: ingreso.monto    
                    })
                }

            }) 

        })

        return {
            totales: totales[0],
            cantidad_pedidos: totalesPedidos[0]?.cantidad_pedidos,
            gastos,
            totalGastos: totalGastosTMP,
            ingresos,
            totalIngresos: totalIngresosTMP,
            dataRepartidores
        };

    }

    async talonariosMasivosPDF(paquete: string): Promise<any> {

        // DATOS DE PEDIDOS

        const pipeline = [];

        const idPaquete = new Types.ObjectId(paquete);
        pipeline.push({ $match: { paquete: idPaquete } });

        // Informacion - Paquete
        pipeline.push({
            $lookup: { // Lookup
                from: 'paquetes',
                localField: 'paquete',
                foreignField: '_id',
                as: 'paquete'
            }
        }
        );

        pipeline.push({ $unwind: '$paquete' });

        // Informacion - Mayorista
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

        // Ordenando datos
        const ordenar: any = {};
        ordenar['repartidor.apellido'] = 1;
        pipeline.push({ $sort: ordenar });

        var pedidosPDF: any = [];

        const pedidos = await this.ventasMayoristasModel.aggregate(pipeline);

        // Generando datos para generacion PDF
        pedidos.map(async pedido => {

            pedidosPDF.push({
                pedido: String(pedido._id),
                fecha: format(new Date(), 'dd/MM/yyyy'),
                mayorista: pedido.mayorista.descripcion,
                telefono: pedido.mayorista.telefono,
                direccion: pedido.mayorista.direccion,
                numero_pedido: pedido.numero,
                numero_paquete: pedido.paquete.numero,
                total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pedido.precio_total),
                repartidor: pedido.repartidor.apellido + ' ' + pedido.repartidor.nombre,
            })

        })


        // DATOS DE PRODUCTOS

        const pipelineProductos = [];
        pipeline.push({ $match: { paquete: idPaquete } });

        // Informacion - Unidad de medida
        pipelineProductos.push({
            $lookup: { // Lookup
                from: 'unidad_medida',
                localField: 'unidad_medida',
                foreignField: '_id',
                as: 'unidad_medida'
            }
        }
        );

        pipelineProductos.push({ $unwind: '$unidad_medida' });

        let productosPDF = [];

        const productos = await this.ventasMayoristasProductosModel.aggregate(pipelineProductos);

        productos.map(producto => {
            productosPDF.push({
                pedido: String(producto.ventas_mayorista),
                descripcion: producto.descripcion,
                unidad_medida: producto.unidad_medida.descripcion,
                precio: producto.precio,
                precio_unitario: producto.precio_unitario,
                cantidad: producto.cantidad
            })
        })

        // UNIFICANDO INFORMACION

        pedidosPDF.map(pedido => {

            let variable = 0;

            productosPDF.map(producto => {
                if (producto.pedido === pedido.pedido) {
                    variable += 1;
                    pedido[`descripcion${variable}`] = producto.descripcion;
                    pedido[`unidad_medida${variable}`] = producto.unidad_medida;
                    pedido[`cantidad${variable}`] = producto.cantidad;
                    pedido[`precio${variable}`] = producto.precio;
                    pedido[`precio_unitario${variable}`] = producto.precio_unitario;
                }
            })

        })

        let html: any;
        html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/talonarios_masivos.html', 'utf-8');

        var options = {
            format: 'A4',
            orientation: 'portrait',
            border: '10mm',
            footer: {
                height: "0mm",
                contents: {}
            }
        }

        const data = {
            fecha: format(new Date(), 'dd/MM/yyyy'),
            pedidos: pedidosPDF
        }

        // Configuraciones de documento
        var document = {
            html: html,
            data,
            path: (process.env.PUBLIC_DIR || './public') + '/pdf/talonarios_masivos.pdf'
        }

        // Generacion de PDF
        await pdf.create(document, options);

        return 'Generacion de PDF correcta';

    }

    // Lista de armado de pedidos general
    async generarArmadoPedidosPDF(paquete: string): Promise<IVentasMayoristasProductos[]> {

        // Se obtiene el paquete
        const paqueteDB = await this.paquetesModel.findByIdAndUpdate(paquete);

        const pipeline = [];

        const idPaquete = new Types.ObjectId(paquete);
        pipeline.push({ $match: { paquete: idPaquete } });

        // Informacion - Venta mayorista
        pipeline.push({
            $lookup: { // Lookup
                from: 'ventas_mayoristas',
                localField: 'ventas_mayorista',
                foreignField: '_id',
                as: 'ventas_mayorista'
            }
        }
        );

        pipeline.push({ $unwind: '$ventas_mayorista' });

        // Informacion - Mayoristas
        pipeline.push({
            $lookup: { // Lookup
                from: 'mayoristas',
                localField: 'ventas_mayorista.mayorista',
                foreignField: '_id',
                as: 'ventas_mayorista.mayorista'
            }
        }
        );

        pipeline.push({ $unwind: '$ventas_mayorista.mayorista' });

        // Informacion - Producto
        pipeline.push({
            $lookup: { // Lookup
                from: 'productos',
                localField: 'producto',
                foreignField: '_id',
                as: 'producto'
            }
        }
        );

        pipeline.push({ $unwind: '$producto' });


        // Informacion - Unidad de medida
        pipeline.push({
            $lookup: { // Lookup
                from: 'unidad_medida',
                localField: 'producto.unidad_medida',
                foreignField: '_id',
                as: 'producto.unidad_medida'
            }
        }
        );

        pipeline.push({ $unwind: '$producto.unidad_medida' });

        // Informacion - Unidad de medida
        pipeline.push({
            $lookup: { // Lookup
                from: 'usuarios',
                localField: 'ventas_mayorista.repartidor',
                foreignField: '_id',
                as: 'ventas_mayorista.repartidor'
            }
        }
        );

        pipeline.push({ $unwind: '$ventas_mayorista.repartidor' });


        // Solo los productos de un repartidor
        // const idRepartidor = new Types.ObjectId(repartidor);
        // pipeline.push({$match: { "ventas_mayorista.repartidor": idRepartidor }});

        // Agrupando resultados por mayorista
        pipeline.push({
            $group: {
                _id: {
                    repartidor_apellido: '$ventas_mayorista.repartidor.apellido',
                    repartidor_nombre: '$ventas_mayorista.repartidor.nombre',
                    mayorista: '$ventas_mayorista.mayorista.descripcion',
                    unidad: '$producto.unidad_medida.descripcion',
                    producto: '$producto.descripcion',
                },
                cantidad: { $sum: '$cantidad' }
            }
        })


        // Ordenando datos
        pipeline.push({
            $sort: {
                '_id.repartidor_apellido': 1,
                '_id.mayorista': 1,
                '_id.producto': 1
            }
        });

        const productos = await this.ventasMayoristasProductosModel.aggregate(pipeline);

        // let arrayMayoristas: string[] = [];
        // let arrayMayoristasPDF: any[] = [];

        // Arreglo de mayoristas
        // productos.map( elemento => {
        //   if(!arrayMayoristas.includes(elemento._id.mayorista)){
        //     arrayMayoristas.unshift(elemento._id.mayorista);
        //     arrayMayoristasPDF.unshift({
        //       descripcion: elemento._id.mayorista
        //     });
        //   }
        // });

        // PRINT DE PANTALLA - PARA TENER UNA GUIA
        // arrayMayoristas.map(mayorista => {
        //   console.log('----------------------------------');
        //   console.log(`MAYORISTA - ${mayorista}`);
        //   console.log('----------------------------------');
        //   productos.map( producto => {
        //     if(producto._id.mayorista === mayorista){
        //       console.log(`${producto._id.producto}`);      
        //       console.log(`${producto._id.unidad}`);
        //       console.log(`CANTIDAD - ${producto.cantidad}`);
        //       console.log('');      
        //     }
        //   });
        // });


        // GENERACION DE PDF

        let html: any;
        html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/productos_preparacion_pedidos.html', 'utf-8');

        var options = {
            format: 'A4',
            orientation: 'portrait',
            border: '10mm',
            footer: {
                height: "0mm",
                contents: {}
            }
        }

        // Configuraciones de documento
        var document = {
            html: html,
            data: {
                fecha: format(new Date(), 'dd/MM/yyyy'),
                productos: productos,
                numero_paquete: paqueteDB.numero
            },
            path: (process.env.PUBLIC_DIR || './public') + '/pdf/productos_preparacion_pedidos.pdf'
        }

        // Generacion de PDF
        await pdf.create(document, options);

        return productos;

    }





}
