import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
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
        const {paquetes, paquetesTotal} = await this.paquetesService.listarPaquetes(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de paquetes correcto',
            paquetes,
            paquetesTotal
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

}
