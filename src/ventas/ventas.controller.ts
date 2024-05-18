import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { VentasUpdateDTO } from './dto/ventas-update.dto';
import { VentasDTO } from './dto/ventas.dto';
import { VentasService } from './ventas.service';

@Controller('ventas')
export class VentasController {

    constructor(private ventasService: VentasService) { }

    // Venta por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getVenta(@Res() res, @Param('id') ventaID) {
        const respuesta = await this.ventasService.getVentas(ventaID);
        res.status(HttpStatus.OK).json({
            message: 'Venta obtenida correctamente',
            venta: respuesta.venta,
            productos: respuesta.productos
        });
    }

    // Listar ventas
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async listarVentas(@Res() res, @Query() querys) {
        const {
            ventas,
            totalItems,
            totalVentas,
            totalFacturado,
            totalPedidosYa,
            totalPedidosYaOnline,
            totalPedidosYaEfectivo,
        } = await this.ventasService.listarVentas(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de ventas correcto',
            ventas,
            totalVentas,
            totalFacturado,
            totalPedidosYa,
            totalPedidosYaOnline,
            totalPedidosYaEfectivo,
            totalItems
        });
    }

    // Crear venta
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async crearVenta(@Res() res, @Body() ventasDTO: VentasDTO) {
        const venta = await this.ventasService.crearVenta(ventasDTO);
        res.status(HttpStatus.CREATED).json({
            message: 'Venta creada correctamente',
            venta
        });
    }

    // Actualizar venta
    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async actualizarVenta(@Res() res, @Body() ventasUpdateDTO: VentasUpdateDTO, @Param('id') ventaID) {
        const venta = await this.ventasService.actualizarVenta(ventaID, ventasUpdateDTO);
        res.status(HttpStatus.OK).json({
            message: 'Venta actualizada correctamente',
            venta
        });
    }

    // Actualizacion de facturacion
    @UseGuards(JwtAuthGuard)
    @Put('/actualizar/facturacion/:id')
    async actualizarFacturacion(@Res() res, @Body() data: any, @Param('id') ventaID) {
        const venta = await this.ventasService.actualizarFacturacion(ventaID, data);
        res.status(HttpStatus.OK).json({
            message: 'Venta facturada correctamente',
            venta
        });
    }

    // Generacion de comprobante
    @UseGuards(JwtAuthGuard)
    @Get('/comprobante/:id')
    async generarComprobante(@Res() res, @Param('id') ventaID) {
        await this.ventasService.comprobanteElectronico(ventaID);
        res.status(HttpStatus.OK).json({
            message: 'Comprobante generado correctamente'
        });
    }

    // Proximo numero de factura
    @UseGuards(JwtAuthGuard)
    @Get('/ultimo/nro/factura/:tipo_factura')
    async proximoNroFactura(@Res() res, @Param('tipo_factura') tipoFactura) {
        const nro_factura = await this.ventasService.proximoNroFactura(tipoFactura);
        res.status(HttpStatus.OK).json({
            nro_factura,
            message: 'Proximo numero de factura correctamente'
        });
    }

    // Obtener contribuyente
    @UseGuards(JwtAuthGuard)
    @Get('/contribuyente/:cuit')
    async getContribuyente(@Res() res, @Param('cuit') cuit) {
        const contribuyente = await this.ventasService.getContribuyente(cuit);
        res.status(HttpStatus.OK).json({
            contribuyente,
            message: 'Contribuyente obtenido correctamente'
        });
    }

}
