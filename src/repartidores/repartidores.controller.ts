import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RepartidoresUpdateDTO } from './dto/repartidores-update.dto';
import { RepartidoresDTO } from './dto/repartidores.dto';
import { RepartidoresService } from './repartidores.service';

@Controller('repartidores')
export class RepartidoresController {

  constructor( private repartidoresService: RepartidoresService ){}

  // Repartidores por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getRepartidor(@Res() res, @Param('id') repartidorID) {
      const repartidor = await this.repartidoresService.getRepartidor(repartidorID);
      res.status(HttpStatus.OK).json({
          message: 'Repartidor obtenido correctamente',
          repartidor
      });
  }

  // Listar repartidores
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarRepartidores(@Res() res, @Query() querys) {
      const repartidores = await this.repartidoresService.listarRepartidores(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de repartidores correcto',
          repartidores
      });
  }

  // Crear repartidor
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearRepartidor(@Res() res, @Body() repartidoresDTO: RepartidoresDTO ) {
      const repartidor = await this.repartidoresService.crearRepartidor(repartidoresDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Repartidor creado correctamente',
          repartidor
      });
  }
    
  // Actualizar repartidor
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarRepartidor(@Res() res, @Body() repartidorUpdateDTO: RepartidoresUpdateDTO, @Param('id') repartidorID ) {
      const repartidor = await this.repartidoresService.actualizarRepartidor(repartidorID, repartidorUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Repartidor actualizado correctamente',
          repartidor
      });
  }

}
