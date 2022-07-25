import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IngresosGastosUpdateDTO } from './dto/ingresos-gastos-update.dto';
import { IngresosGastosDTO } from './dto/ingresos-gastos.dto';
import { IngresosGastosService } from './ingresos-gastos.service';

@Controller('ingresos-gastos')
export class IngresosGastosController {

    constructor( private ingresosGastosService: IngresosGastosService ){}

    // Ingreso/Gasto por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getIngresoGasto(@Res() res, @Param('id') ingresoGastoID) {
        const ingresosGastos = await this.ingresosGastosService.getIngresosGastos(ingresoGastoID);
        res.status(HttpStatus.OK).json({
            message: 'Ingreso o gasto obtenido correctamente',
            ingresosGastos
        });
    }
  
    // Listar ingresos/gastos
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async listarIngresosGastos(@Res() res, @Query() querys) {
        const {ingresos, gastos, totalIngresos, totalGastos} = await this.ingresosGastosService.listarIngresosGastos(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de ingresos/gastos correcto',
            ingresos,
            gastos,
            totalIngresos,
            totalGastos
        });
    }
  
    // Crear ingreso/gastos
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async crearIngresosGastos(@Res() res, @Body() ingresosGastosDTO: IngresosGastosDTO ) {
        const ingresosGastos = await this.ingresosGastosService.crearIngresoGasto(ingresosGastosDTO);        
        res.status(HttpStatus.CREATED).json({
            message: 'Ingreso o gasto creado correctamente',
            ingresosGastos
        });
    }
      
    // Actualizar ingresos/gastos
    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async actualizarIngresosGastos(@Res() res, @Body() ingresosGastosUpdateDTO: IngresosGastosUpdateDTO, @Param('id') ingresoGastoID ) {
        const ingresosGastos = await this.ingresosGastosService.actualizarIngresoGasto(ingresoGastoID, ingresosGastosUpdateDTO);
        res.status(HttpStatus.OK).json({
            message: 'Ingreso o gasto actualizado correctamente',
            ingresosGastos
        });
    }

    // Eliminar ingresos/gastos
    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async eliminarIngresosGastos(@Res() res, @Param('id') ingresoGastoID ) {
        const ingresosGastos = await this.ingresosGastosService.eliminarIngresoGasto(ingresoGastoID);
        res.status(HttpStatus.OK).json({
            message: 'Ingreso o gasto eliminado correctamente',
            ingresosGastos
        });
    }

}
