import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MayoristasDTO } from './dto/mayoristas.dto';
import * as bcryptjs from 'bcryptjs';
import { MayoristasService } from './mayoristas.service';
import { MayoristasUpdateDTO } from './dto/mayoristas-update.dto';

@Controller('mayoristas')
export class MayoristasController {
  constructor( private mayoristasService: MayoristasService ){}

    // Mayorista por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getMayorista(@Res() res, @Param('id') mayoristaID) {
        const mayorista = await this.mayoristasService.getMayorista(mayoristaID);
        res.status(HttpStatus.OK).json({
            message: 'Mayorista obtenido correctamente',
            mayorista
        });
    }

    // Listar mayoristas
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async listarMayoristas(@Res() res, @Query() querys) {
        const mayoristas = await this.mayoristasService.listarMayoristas(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de mayoristas correcto',
            mayoristas
        });
    }
    
    // Actualizar mayorista
    @Put('/:id')
    async actualizarUsuario(@Res() res, @Body() mayoristaUpdateDTO: MayoristasUpdateDTO, @Param('id') mayoristaID ) {

        const { password } = mayoristaUpdateDTO;

        if(password){
            const salt = bcryptjs.genSaltSync();
            mayoristaUpdateDTO.password = bcryptjs.hashSync(password, salt);
        }

        const mayorista = await this.mayoristasService.actualizarMayorista(mayoristaID, mayoristaUpdateDTO);

        res.status(HttpStatus.OK).json({
            message: 'Mayorista actualizado correctamente',
            mayorista
        });

    }
    
}
