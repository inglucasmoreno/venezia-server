import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PaquetesUpdateDTO } from './dto/paquetes-update.dto';
import { PaquetesDTO } from './dto/paquetes.dto';
import { PaquetesService } from './paquetes.service';

@Controller('paquetes')
export class PaquetesController {

    constructor(private paquetesService: PaquetesService) { }

    // Paquete por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getPaquete(@Res() res, @Param('id') paqueteID) {
        const paquete = await this.paquetesService.getPaquete(paqueteID);
        res.status(HttpStatus.OK).json({
            message: 'Paquete obtenido correctamente',
            paquete
        });
    }

    // Listar paquetes
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async listarPaquetes(@Res() res, @Query() querys) {
        const { paquetes, totalItems } = await this.paquetesService.listarPaquetes(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de paquetes correcto',
            paquetes,
            totalItems
        });
    }

    // Enviar paquete
    @UseGuards(JwtAuthGuard)
    @Get('/enviar/:paquete')
    async enviarPaquete(@Res() res, @Param('paquete') paqueteID, @Query() querys) {
        await this.paquetesService.enviarPaquete(paqueteID, querys);
        res.status(HttpStatus.OK).json({
            message: 'Paquete enviado correctamente',
        });
    }

    // Envio masivo de paquetes
    @UseGuards(JwtAuthGuard)
    @Get('/enviar/masivo/total')
    async envioMasivoPaquetes(@Res() res, @Query() querys) {
        await this.paquetesService.envioMasivoPaquetes(querys);
        res.status(HttpStatus.OK).json({
            message: 'Paquetes enviados correctamente',
        });
    }

    // Crear paquete
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async crearPaquete(@Res() res, @Body() paquetesDTO: PaquetesDTO) {
        const paquete = await this.paquetesService.crearPaquete(paquetesDTO);
        res.status(HttpStatus.CREATED).json({
            message: 'Paquete creado correctamente',
            paquete
        });
    }

    // Completar paquete
    @UseGuards(JwtAuthGuard)
    @Post('/completar')
    async completarPaquete(@Res() res, @Body() data: any) {
        const paquete = await this.paquetesService.completarPaquete(data);
        res.status(HttpStatus.CREATED).json({
            message: 'Paquete completado correctamente',
            paquete
        });
    }

    // Actualizar paquete
    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async actualizarPaquete(@Res() res, @Body() paquetesUpdateDTO: PaquetesUpdateDTO, @Param('id') paqueteID) {
        const paquete = await this.paquetesService.actualizarPaquete(paqueteID, paquetesUpdateDTO);
        res.status(HttpStatus.OK).json({
            message: 'Paquete actualizado correctamente',
            paquete
        });
    }

    // Eliminar paquete
    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async eliminarVenta(@Res() res, @Param('id') paqueteID) {
        const venta = await this.paquetesService.eliminarPaquete(paqueteID);
        res.status(HttpStatus.OK).json({
            message: 'Paquete eliminado correctamente',
            venta
        });
    }

}
