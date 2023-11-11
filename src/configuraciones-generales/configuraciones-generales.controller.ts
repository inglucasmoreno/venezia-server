import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ConfiguracionesGeneralesService } from './configuraciones-generales.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ConfiguracionesGeneralesDTO } from './dto/configuraciones-generales.dto';
import { ConfiguracionesGeneralesUpdateDTO } from './dto/configuraciones-generales-update.dto';

@Controller('configuraciones-generales')
export class ConfiguracionesGeneralesController {

  constructor(private configuracionesGeneralesService: ConfiguracionesGeneralesService) { }

  // Configuracion por ID
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getConfiguraciones(@Res() res, @Param('id') configuracionID) {
    const configuraciones = await this.configuracionesGeneralesService.getConfiguraciones();
    res.status(HttpStatus.OK).json({
      message: 'Configuraciones obtenidas correctamente',
      configuraciones
    });
  }

  // Listar configuraciones
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarConfiguraciones(@Res() res, @Query() querys) {
    const configuraciones = await this.configuracionesGeneralesService.listarConfiguraciones(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de configuraciones correcto',
      configuraciones
    });
  }

  // Crear configuracion
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearConfiguracion(@Res() res, @Body() configuracionesGeneralesDTO: ConfiguracionesGeneralesDTO) {
    const configuracion = await this.configuracionesGeneralesService.crearConfiguracion(configuracionesGeneralesDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Configuracion creada correctamente',
      configuracion
    });
  }

  // Actualizar configuracion
  @UseGuards(JwtAuthGuard)
  @Put('/')
  async actualizarConfiguracion(@Res() res, @Body() configuracionesGeneralesUpdateDTO: ConfiguracionesGeneralesUpdateDTO) {
    const configuraciones = await this.configuracionesGeneralesService.actualizarConfiguracion(configuracionesGeneralesUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Configuraciones actualizadas correctamente',
      configuraciones
    });
  }

}
