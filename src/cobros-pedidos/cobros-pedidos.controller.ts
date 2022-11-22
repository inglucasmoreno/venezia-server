import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CobrosPedidosService } from './cobros-pedidos.service';
import { CobrosPedidosUpdateDTO } from './dto/cobros-pedidos-update.dto';
import { CobrosPedidosDTO } from './dto/cobros-pedidos.dto';

@Controller('cobros-pedidos')
export class CobrosPedidosController {

  constructor( private relacionesService: CobrosPedidosService ){}

  // Relacion por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getRelacion(@Res() res, @Param('id') relacionID) {
      const relacion = await this.relacionesService.getRelacion(relacionID);
      res.status(HttpStatus.OK).json({
          message: 'Relacion obtenida correctamente',
          relacion
      });
  }

  // Listar relaciones
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarRelaciones(@Res() res, @Query() querys) {
      const relaciones = await this.relacionesService.listarRelaciones(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de relaciones correcto',
          relaciones
      });
  }

  // Crear relacion
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearRelacion(@Res() res, @Body() relacionesDTO: CobrosPedidosDTO ) {
      const relacion = await this.relacionesService.crearRelacion(relacionesDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Relacion creada correctamente',
          relacion
      });
  }
    
  // Actualizar relacion
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarRelacion(@Res() res, @Body() relacionesUpdateDTO: CobrosPedidosUpdateDTO, @Param('id') relacionID ) {
      const relacion = await this.relacionesService.actualizarRelacion(relacionID, relacionesUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Relacion actualizada correctamente',
          relacion
      });
  }

}
