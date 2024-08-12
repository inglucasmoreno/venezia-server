import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { MesasService } from './mesas.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MesasDTO } from './dto/mesas.dto';
import { MesasUpdateDTO } from './dto/mesas-update.dto';

@Controller('mesas')
export class MesasController {

  constructor( private mesasService: MesasService ){}

  // Mesa por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getUnidad(@Res() res, @Param('id') mesaID) {
      const mesa = await this.mesasService.getMesa(mesaID);
      res.status(HttpStatus.OK).json({
          message: 'Mesa obtenida correctamente',
          mesa
      });
  }

  // Listar mesas
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarMesas(@Res() res, @Query() querys) {
      const mesas = await this.mesasService.listarMesas(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de mesas correcto',
          mesas
      });
  }

  // Crear mesa
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearMesa(@Res() res, @Body() mesasDTO: MesasDTO ) {
      const mesa = await this.mesasService.crearMesa(mesasDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Mesa creada correctamente',
          mesa
      });
  }
    
  // Actualizar mesa
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarMesa(@Res() res, @Body() mesasUpdateDTO: MesasUpdateDTO, @Param('id') mesaID ) {
      const mesa = await this.mesasService.actualizarMesa(mesaID, mesasUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Mesa actualizada correctamente',
          mesa
      });
  }

  // Eliminar mesa
    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async eliminarMesa(@Res() res, @Param('id') mesaID ) {
        await this.mesasService.eliminarMesa(mesaID);
        res.status(HttpStatus.OK).json({
            message: 'Mesa eliminada correctamente',
        });
    }

}
