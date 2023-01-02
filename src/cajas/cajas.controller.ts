import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CajasService } from './cajas.service';
import { CajasUpdateDTO } from './dto/cajas-update';
import { CajasDTO } from './dto/cajas.dto';

@Controller('cajas')
export class CajasController {
  constructor( private cajasService: CajasService ){}

    // Caja por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getCaja(@Res() res, @Param('id') cajaID) {
        const caja = await this.cajasService.getCaja(cajaID);
        res.status(HttpStatus.OK).json({
            message: 'Caja obtenida correctamente',
            caja
        });
    }

    // Calculos iniciales
    @UseGuards(JwtAuthGuard)
    @Get('/calculos/iniciales')
    async calculosIniciales(@Res() res) {
        const valores = await this.cajasService.calculosIniciales();
        res.status(HttpStatus.OK).json({
            message: 'Valores obtenida correctamente',
            valores
        });
    }

    // Listar cajas
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async listarCajas(@Res() res, @Query() querys) {
        const { cajas, totalItems } = await this.cajasService.listarCajas(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de cajas correcto',
            cajas,
            totalItems
        });
    }

    // Crear caja
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async crearCaja(@Res() res, @Body() cajasDTO: CajasDTO ) {
        const caja = await this.cajasService.crearCaja(cajasDTO);        
        res.status(HttpStatus.CREATED).json({
            message: 'Caja creada correctamente',
            caja
        });
    }
        
    // Actualizar caja
    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async actualizarCaja(@Res() res, @Body() cajaUpdateDTO: CajasUpdateDTO, @Param('id') cajaID ) {
        const caja = await this.cajasService.actualizarCaja(cajaID, cajaUpdateDTO);
        res.status(HttpStatus.OK).json({
            message: 'Caja actualizada correctamente',
            caja
        });
    }

    // Actualizar saldo inicial de caja
    @UseGuards(JwtAuthGuard)
    @Put('/update/saldo-inicial')
    async actualizarSaldoInicial(@Res() res, @Body() data: any ) {
        const saldoInicial = await this.cajasService.actualizarSaldoInicial(data);
        res.status(HttpStatus.OK).json({
            message: 'Saldo inicial actualizado correctamente',
            saldoInicial
        });
    }

    // Reportes de cajas
    @UseGuards(JwtAuthGuard)
    @Get('/reportes/acumulacion/estadisticas')
    async reporteCajas(@Res() res, @Query() querys) {
        const reportes = await this.cajasService.reporteCajas(querys);
        res.status(HttpStatus.OK).json({
            message: 'Reporte de cajas generado correctamente',
            reportes
        })
    }

    // Reportes de cajas - PDF
    @UseGuards(JwtAuthGuard)
    @Post('/reportes/acumulacion/estadisticas/pdf')
    async reporteCajasPDF(@Res() res, @Body() data: any) {
        await this.cajasService.reporteCajasPDF(data);
        res.status(HttpStatus.OK).json({
            message: 'Reporte de cajas en PDF generado correctamente'
        });
    }  

}

