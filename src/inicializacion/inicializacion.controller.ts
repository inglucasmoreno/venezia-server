import { Controller, Get, HttpStatus, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { InicializacionService } from './inicializacion.service';

@ApiTags('Inicializacion')
@Controller('inicializacion')
export class InicializacionController {

    constructor(private inicializacionService: InicializacionService){}

    // Inicializacion de usuarios
    @ApiOkResponse({ description: 'Usuarios inicializados correctamente' })
    @Get('/usuarios')
    async initUsuarios(@Res() res){
        await this.inicializacionService.initUsuarios();
        res.status(HttpStatus.OK).json({
            message: 'Inicializacion completado correctamente'
        })
    }
    
    // Importacion de productos - Archivo excel (.xlsx)
    @ApiOkResponse({ description: 'Productos importados correctamente' })
    @UseInterceptors(
        FileInterceptor(
            'file',
            {
                storage: diskStorage({
                    destination: './importar',
                    filename: function(req, file, cb){
                        cb(null, 'productos.xlsx')
                    }
                })
            }
        )
    )
    @Post('/productos')
    async importarProductos(@UploadedFile() file: Express.Multer.File, @Query() query: any) {
        
        const msg = await this.inicializacionService.importarProductos(query);

        return {
            msg
        }

    }

}
