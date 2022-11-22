import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MayoristasTiposIngresosUpdateDTO } from './dto/mayorista-tipos-ingresos-update.dto';
import { MayoristasTiposIngresosDTO } from './dto/mayorista-tipos-ingresos.dto';
import { MayoristasTiposIngresosService } from './mayoristas-tipos-ingresos.service';

@Controller('mayoristas-tipos-ingresos')
export class MayoristasTiposIngresosController {

  constructor(private tiposIngresosService: MayoristasTiposIngresosService) { }

  // Tipo por ID
   @UseGuards(JwtAuthGuard)
   @Get('/:id')
   async getTipo(@Res() res, @Param('id') tipoID) {
     const tipo = await this.tiposIngresosService.getTipo(tipoID);
     res.status(HttpStatus.OK).json({
       message: 'Tipo obtenido correctamente',
       tipo
     });
   }
 
   // Listar tipos
   @UseGuards(JwtAuthGuard)
   @Get('/')
   async listarTipos(@Res() res, @Query() querys) {
     const tipos = await this.tiposIngresosService.listarTipos(querys);
     res.status(HttpStatus.OK).json({
       message: 'Listado de tipos correcto',
       tipos
     });
   }
 
   // Crear tipo
   @UseGuards(JwtAuthGuard)
   @Post('/')
   async crearTipo(@Res() res, @Body() tiposGastosDTO: MayoristasTiposIngresosDTO) {
     const tipo = await this.tiposIngresosService.crearTipo(tiposGastosDTO);
     res.status(HttpStatus.CREATED).json({
       message: 'Tipo creado correctamente',
       tipo
     });
   }
 
   // Actualizar tipo
   @UseGuards(JwtAuthGuard)
   @Put('/:id')
   async actualizarTipo(@Res() res, @Body() tiposIngresosUpdateDTO: MayoristasTiposIngresosUpdateDTO, @Param('id') tipoID) {
     const tipo = await this.tiposIngresosService.actualizarTipo(tipoID, tiposIngresosUpdateDTO);
     res.status(HttpStatus.OK).json({
       message: 'Tipo actualizado correctamente',
       tipo
     });
   }

}
