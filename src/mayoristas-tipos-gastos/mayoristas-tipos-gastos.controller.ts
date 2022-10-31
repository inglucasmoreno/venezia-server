import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MayoristasTiposGastosUpdateDTO } from './dto/mayoristas-tipos-gastos-update.dto';
import { MayoristasTiposGastosDTO } from './dto/mayoristas-tipos-gastos.dto';
import { MayoristasTiposGastosService } from './mayoristas-tipos-gastos.service';

@Controller('mayoristas-tipos-gastos')
export class MayoristasTiposGastosController {
  constructor(private tiposGastosService: MayoristasTiposGastosService) { }

  // Tipo por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getTipo(@Res() res, @Param('id') tipoID) {
    const tipo = await this.tiposGastosService.getTipo(tipoID);
    res.status(HttpStatus.OK).json({
      message: 'Tipo obtenido correctamente',
      tipo
    });
  }

  // Listar tipos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarTipos(@Res() res, @Query() querys) {
    const tipos = await this.tiposGastosService.listarTipos(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de tipos correcto',
      tipos
    });
  }

  // Crear tipo
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearTipo(@Res() res, @Body() tiposGastosDTO: MayoristasTiposGastosDTO) {
    const tipo = await this.tiposGastosService.crearTipo(tiposGastosDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Tipo creado correctamente',
      tipo
    });
  }

  // Actualizar tipo
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarTipo(@Res() res, @Body() tiposGastosUpdateDTO: MayoristasTiposGastosUpdateDTO, @Param('id') tipoID) {
    const tipo = await this.tiposGastosService.actualizarTipo(tipoID, tiposGastosUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Tipo actualizado correctamente',
      tipo
    });
  }

}
