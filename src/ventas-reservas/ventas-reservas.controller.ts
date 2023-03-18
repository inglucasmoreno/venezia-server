import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { VentasReservasUpdateDTO } from './dto/ventas-reservas-update.dto';
import { VentasReservasDTO } from './dto/ventas-reservas.dto';
import { VentasReservasService } from './ventas-reservas.service';

@Controller('ventas-reservas')
export class VentasReservasController {

    constructor(private ventasReservasService: VentasReservasService) { }

    // Relacion por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getRelacion(@Res() res, @Param('id') relacionID) {
        const relacion = await this.ventasReservasService.getRelacion(relacionID);
        res.status(HttpStatus.OK).json({
            message: 'Relacion obtenida correctamente',
            relacion
        });
    }

    // Relacion por venta
    @UseGuards(JwtAuthGuard)
    @Get('/venta/:venta')
    async getRelacionPorVenta(@Res() res, @Param('venta') ventaID) {
        const relacion = await this.ventasReservasService.getRelacionPorVenta(ventaID);
        res.status(HttpStatus.OK).json({
            message: 'Relacion obtenida correctamente',
            relacion
        });
    }

    // Listar relaciones
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async listarRelaciones(@Res() res, @Query() querys) {
        const relaciones = await this.ventasReservasService.listarRelaciones(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de relaciones correcto',
            relaciones
        });
    }

    // Crear relacion
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async crearRelacion(@Res() res, @Body() ventasReservasDTO: VentasReservasDTO) {
        const relacion = await this.ventasReservasService.crearRelacion(ventasReservasDTO);
        res.status(HttpStatus.CREATED).json({
            message: 'Relacion creada correctamente',
            relacion
        });
    }

    // Actualizar relacion
    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async actualizarRelacion(@Res() res, @Body() ventasReservasUpdateDTO: VentasReservasUpdateDTO, @Param('id') relacionID) {
        const relacion = await this.ventasReservasService.actualizarRelacion(relacionID, ventasReservasUpdateDTO);
        res.status(HttpStatus.OK).json({
            message: 'Relacion actualizada correctamente',
            relacion
        });
    }

}
