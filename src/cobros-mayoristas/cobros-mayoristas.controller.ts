import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CobrosMayoristasService } from './cobros-mayoristas.service';
import { CobrosMayoristasUpdateDTO } from './dto/cobros-mayoristas-update.dto';
import { CobrosMayoristasDTO } from './dto/cobros-mayoristas.dto';

@Controller('cobros-mayoristas')
export class CobrosMayoristasController {

  constructor( private cobrosService: CobrosMayoristasService ){}

  // Cobro por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getCobro(@Res() res, @Param('id') cobroID) {
      const cobro = await this.cobrosService.getCobro(cobroID);
      res.status(HttpStatus.OK).json({
          message: 'Cobro obtenido correctamente',
          cobro
      });
  }

  // Listar cobros
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarCobros(@Res() res, @Query() querys) {
      const cobros = await this.cobrosService.listarCobros(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de cobros correcto',
          cobros
      });
  }

  // Crear cobro
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearCobro(@Res() res, @Body() cobrosDTO: CobrosMayoristasDTO ) {
      const cobro = await this.cobrosService.crearCobro(cobrosDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Cobro creado correctamente',
          cobro
      });
  }
    
  // Actualizar cobro
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarCobro(@Res() res, @Body() cobrosUpdateDTO: CobrosMayoristasUpdateDTO, @Param('id') cobroID ) {
      const cobro = await this.cobrosService.actualizarCobro(cobroID, cobrosUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Cobro actualizado correctamente',
          cobro
      });
  }

}
