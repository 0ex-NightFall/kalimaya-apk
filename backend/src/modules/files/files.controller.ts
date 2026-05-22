import { Controller, Delete, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Response } from 'express';
import { JwtAuthGuard } from '../../shared/jwt-auth.guard';
import { FilesService } from './files.service';

const STORAGE_DIR = process.env.STORAGE_PATH || '/root/kalimaya/storage';
if (!existsSync(STORAGE_DIR)) mkdirSync(STORAGE_DIR, { recursive: true });

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private svc: FilesService) {}

  @Get()
  list(@Req() req: any) { return this.svc.list(req.user); }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: STORAGE_DIR,
      filename: (_req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}-${safe}`);
      },
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
  }))
  upload(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    return this.svc.create(req.user, file);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    const rec = await this.svc.getOne(id, req.user);
    return res.download(rec.storagePath, rec.name);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) { return this.svc.remove(id, req.user); }
}
