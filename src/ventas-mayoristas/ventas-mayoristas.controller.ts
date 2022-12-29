import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { VentasMayoristasUpdateDTO } from './dto/ventas-mayoristas-update.dto';
import { VentasMayoristasService } from './ventas-mayoristas.service';

@Controller('ventas-mayoristas')
export class VentasMayoristasController {

    constructor(private ventasService: VentasMayoristasService) { }

    // Venta por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getVentas(@Res() res, @Param('id') ventaID) {
        const venta = await this.ventasService.getVenta(ventaID);
        res.status(HttpStatus.OK).json({
            message: 'Venta obtenido correctamente',
            venta
        });
    }

    // Enviar todos los pedidos
    @UseGuards(JwtAuthGuard)
    @Get('/envio/masivo/:repartidor')
    async envioMasivo(@Res() res, @Param('repartidor') repartidor) {
        await this.ventasService.envioMasivo(repartidor);
        res.status(HttpStatus.OK).json({
            message: 'Pedidos enviados correctamente',
        });
    }

    // Listar ventas
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async listarVentas(@Res() res, @Query() querys) {
        const { ventas, totalItems, totalDeuda, totalIngresos, totalMonto } = await this.ventasService.listarVentas(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de ventas correcto',
            ventas,
            totalItems,
            totalDeuda,
            totalIngresos,
            totalMonto
        });
    }

    // Crear ventas
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async crearVentas(@Res() res, @Body() data: any) {
        await this.ventasService.crearVenta(data);
        res.status(HttpStatus.CREATED).json({
            message: 'Venta creada correctamente',
        });
    }

    // Actualizar venta
    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async actualizarVenta(@Res() res, @Body() ventaUpdateDTO: VentasMayoristasUpdateDTO, @Param('id') ventaID) {

        const venta = await this.ventasService.actualizarVenta(ventaID, ventaUpdateDTO);

        res.status(HttpStatus.OK).json({
            message: 'Venta actualizada correctamente',
            venta
        });

    }

    // Completar venta
    @UseGuards(JwtAuthGuard)
    @Put('/completar/venta/:id')
    async completarVenta(@Res() res, @Body() data: any, @Param('id') ventaID) {

        const venta = await this.ventasService.completarVenta(ventaID, data);

        res.status(HttpStatus.OK).json({
            message: 'Venta completada correctamente',
            venta
        });

    }

    // Generacion - Detalles de pedido - PDF
    @UseGuards(JwtAuthGuard)
    @Get('/detalles-pedido/:id')
    async generarDetallesPDF(@Res() res, @Param('id') ventaID) {
        await this.ventasService.generarDetallesPDF(ventaID);
        res.status(HttpStatus.OK).json({
            message: 'Detalles generados correctamente en PDF'
        });
    }

    // Generacion - Detalles de deudas - PDF
    @UseGuards(JwtAuthGuard)
    @Get('/detalles-deudas/pdf')
    async detallesDeudasPDF(@Res() res) {
        await this.ventasService.detallesDeudasPDF();
        res.status(HttpStatus.OK).json({
            message: 'Detalles generados correctamente en PDF'
        });
    }

    // Reporte -> Repartidores
    @UseGuards(JwtAuthGuard)
    @Get('/reportes/repartidores/web')
    async reporteRepartidores(@Res() res, @Query() querys) {
        const reportes = await this.ventasService.reporteRepartidores(querys);
        res.status(HttpStatus.OK).json({
            message: 'Reporte generado correctamente',
            reportes
        });
    }

}

