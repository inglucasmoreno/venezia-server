import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CajasMayoristasService } from './cajas-mayoristas.service';
import { CajasMayoristasUpdateDTO } from './dto/cajas-mayoristas-update.dto';
import { CajasMayoristasDTO } from './dto/cajas-mayoristas.dto';

@Controller('cajas-mayoristas')
export class CajasMayoristasController {

  constructor( private cajasMayoristasService: CajasMayoristasService ){}

  // Caja por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getCaja(@Res() res, @Param('id') cajaID) {
      const caja = await this.cajasMayoristasService.getCaja(cajaID);
      res.status(HttpStatus.OK).json({
          message: 'Caja obtenida correctamente',
          caja
      });
  }

  // Listar cajas
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarCajas(@Res() res, @Query() querys) {
      const cajas = await this.cajasMayoristasService.listarCajas(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de cajas',
          cajas
      });
  }

  // Calculos inciales
  @UseGuards(JwtAuthGuard)
  @Get('/calculos/iniciales')
  async calculosIniciales(@Res() res, @Query() querys) {
      const {datos, gastos, ingresos, total_gastos, total_ingresos, total_recibido, cobros, total_cobros} = await this.cajasMayoristasService.calculosIniciales(querys);
      res.status(HttpStatus.OK).json({
          message: 'Datos obtenidos correctamente',
          datos,
          gastos,
          ingresos,
          total_gastos,
          total_ingresos,
          total_recibido,
          cobros,
          total_cobros
      });
  }

  // Crear caja
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearCaja(@Res() res, @Body() cajasMayoristasDTO: CajasMayoristasDTO ) {
      const caja = await this.cajasMayoristasService.crearCaja(cajasMayoristasDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Caja creada correctamente',
          caja
      });
  }    

  // Actualizar caja
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarCaja(@Res() res, @Body() cajasMayoristasUpdateDTO: CajasMayoristasUpdateDTO, @Param('id') cajaID ) {
      const caja = await this.cajasMayoristasService.actualizarCaja(cajaID, cajasMayoristasUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Caja actualizada correctamente',
          caja
      });
  }

}
