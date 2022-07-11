import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UnidadMedidaUpdateDTO } from './dto/unidad-medida-update.dto';
import { UnidadMedidaDTO } from './dto/unidad-medida.dto';
import { UnidadMedidaService } from './unidad-medida.service';

@Controller('unidad-medida')
export class UnidadMedidaController {
  constructor( private unidadMedidaService: UnidadMedidaService ){}

  // Unidad por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getUnidad(@Res() res, @Param('id') unidadID) {
      const unidad = await this.unidadMedidaService.getUnidad(unidadID);
      res.status(HttpStatus.OK).json({
          message: 'Unidad obtenida correctamente',
          unidad
      });
  }

  // Listar unidades
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarUnidades(@Res() res, @Query() querys) {
      const unidades = await this.unidadMedidaService.listarUnidades(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de unidades correcto',
          unidades
      });
  }

  // Crear unidad
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearUnidad(@Res() res, @Body() unidadMedidaDTO: UnidadMedidaDTO ) {
      const unidad = await this.unidadMedidaService.crearUnidad(unidadMedidaDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Unidad creada correctamente',
          unidad
      });
  }
    
  // Actualizar unidad
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarUnidad(@Res() res, @Body() unidadMedidaUpdateDTO: UnidadMedidaUpdateDTO, @Param('id') unidadID ) {
      
      const unidad = await this.unidadMedidaService.actualizarUnidad(unidadID, unidadMedidaUpdateDTO);

      res.status(HttpStatus.OK).json({
          message: 'Unidad actualizada correctamente',
          unidad
      });

  }
}
