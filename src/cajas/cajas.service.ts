import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IIngresosGastos } from 'src/ingresos-gastos/interface/ingresos-gastos.schema';
import { IVentas } from 'src/ventas/interface/ventas.interface';
import { CajasUpdateDTO } from './dto/cajas-update';
import { CajasDTO } from './dto/cajas.dto';
import { ICajas } from './interface/cajas.interface';
import { ISaldoInicial } from './interface/saldo-inicial.interface';

@Injectable()
export class CajasService {

  constructor(
      @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
      @InjectModel('SaldoInicial') private readonly saldoInicialModel: Model<ISaldoInicial>,
      @InjectModel('IngresosGastos') private readonly ingresosGastosModel: Model<IIngresosGastos>,
      @InjectModel('Ventas') private readonly ventasModel: Model<IVentas>  
    ){}

    // Caja por ID
  async getCaja(id: string): Promise<ICajas> {

    const cajaDB = await this.cajasModel.findById(id);
    if(!cajaDB) throw new NotFoundException('La caja no existe');

    const pipeline = [];

    const idCaja = new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idCaja} }) 

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }}
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }}
    );

    pipeline.push({ $unwind: '$updatorUser' });

    const caja = await this.cajasModel.aggregate(pipeline);

    return caja[0];

  } 

  // Listar cajas
  async listarCajas(querys: any): Promise<ICajas[]> {

  const {columna, direccion} = querys;

  const pipeline = [];
  pipeline.push({$match:{}});
  
  // Informacion de usuario creador
  pipeline.push({
    $lookup: { // Lookup
      from: 'usuarios',
      localField: 'creatorUser',
      foreignField: '_id',
      as: 'creatorUser'
    }}
  );

  pipeline.push({ $unwind: '$creatorUser' });

  // Informacion de usuario actualizador
  pipeline.push({
    $lookup: { // Lookup
      from: 'usuarios',
      localField: 'updatorUser',
      foreignField: '_id',
      as: 'updatorUser'
    }}
  );

  pipeline.push({ $unwind: '$updatorUser' });

  // Ordenando datos
  const ordenar: any = {};
  if(columna){
    ordenar[String(columna)] = Number(direccion);
    pipeline.push({$sort: ordenar});
  }      

  const cajas = await this.cajasModel.aggregate(pipeline);

  return cajas;

  }  

  // Calculos iniciales
  async calculosIniciales(): Promise<any> {
    const ventasActivas = await this.ventasModel.find({ activo: true });
    
    // Variables iniciales
    let total_ventas = 0;
    let total_adicional_credito = 0;
    let total_facturado = 0;
    let total_credito = 0;
    let total_debito = 0;
    let total_mercadopago = 0;
    let total_efectivo = 0;
    let total_balanza = 0;
    let total_no_balanza = 0;
    let total_postnet = 0;

    ventasActivas.map(venta => {

      // Adicional credito
      total_adicional_credito += venta.adicional_credito;

      // Monto de venta total
      total_ventas += venta.precio_total;

      // Monto balanza y no balanza
      total_balanza += venta.total_balanza;
      total_no_balanza += venta.total_no_balanza;

      // Monto facturado
      if(venta.comprobante === 'Fiscal') total_facturado += venta.precio_total;

      // Calculos sobre -> Formas de pago
      venta['forma_pago'].map(formaPago => {
        if(formaPago.descripcion === 'Efectivo') total_efectivo += formaPago.valor;
        if(formaPago.descripcion === 'Crédito') total_credito += formaPago.valor; 
        if(formaPago.descripcion === 'Débito') total_debito += formaPago.valor; 
        if(formaPago.descripcion === 'Mercado pago') total_mercadopago += formaPago.valor;  
        if(formaPago.descripcion === 'Crédito' || formaPago.descripcion === 'Débito' || formaPago.descripcion === 'Mercado pago') total_postnet += formaPago.valor;      
      })
    
    })

    // Ingresos y Gastos
    const ingresosGastos = await this.ingresosGastosModel.find({ activo: true });

    let ingresos: any[] = [];
    let gastos: any[] = [];
    let totalGastos = 0;
    let totalIngresos = 0;

    ingresosGastos.map( elemento => {
      if(elemento.tipo === 'gasto') {
        totalGastos += elemento.monto;
        gastos.push(elemento);
      }
      else {
        ingresos.push(elemento);
        totalIngresos += elemento.monto;
      }
    });

    // Saldo inicial de caja
    const idSaldoInicial = '222222222222222222222222';
    const saldoInicial = await this.saldoInicialModel.findById(idSaldoInicial);

    return {
      saldoInicial: saldoInicial.monto,
      ingresos,
      gastos,
      totalGastos,
      totalIngresos,
      total_ventas,
      total_balanza,
      total_adicional_credito,
      total_no_balanza,
      total_facturado,
      total_postnet,
      total_credito,
      total_debito,
      total_efectivo,
      total_mercadopago,
    }

  }  

  // Crear caja
  async crearCaja(cajasDTO: CajasDTO): Promise<ICajas> {

    const nuevaCaja = new this.cajasModel(cajasDTO);
    const idSaldoInicial = '222222222222222222222222';

    // 1 - Se crea la caja
    // 2 - Baja de ventas
    // 3 - Eliminar Ingresos y Gastos temporales
    // 4 - Actualizacion de saldo de nueva caja

    const [ respuestaCaja ] = await Promise.all([
      nuevaCaja.save(),
      this.ventasModel.updateMany({},{activo: false}),
      this.ingresosGastosModel.deleteMany(),
      this.saldoInicialModel.findByIdAndUpdate(idSaldoInicial, {monto: cajasDTO.saldo_proxima_caja})
    ])
    
    // 1) - Crear nueva caja
    // const respuestaCaja = await nuevaCaja.save();

    // 2) - Baja de ventas
    // await this.ventasModel.updateMany({},{activo: false});

    // 3) - Eliminar ingresos y gastos
    // await this.ingresosGastosModel.deleteMany();

    // 4) - Caja con nuevo saldo
    // await this.saldoInicialModel.findByIdAndUpdate(idSaldoInicial, {monto: cajasDTO.saldo_proxima_caja});

    return respuestaCaja;
  
  }

  // Actualizar caja
  async actualizarCaja(id: string, cajasUpdateDTO: CajasUpdateDTO): Promise<ICajas> {
    const caja = await this.cajasModel.findByIdAndUpdate(id, cajasUpdateDTO, {new: true});
    return caja;
  }

  // Actualizar saldo inicial de caja
  async actualizarSaldoInicial(data: any): Promise<ISaldoInicial> {
    const idSaldo = '222222222222222222222222';
    const saldoInicial = await this.saldoInicialModel.findByIdAndUpdate(idSaldo, data, {new: true});
    return saldoInicial;
  }

}
