import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { FileValidationPipe } from './dto/fileValidation.pipe';
import { Express } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  /**
   * avatar upload
   * @param user
   */
  @Post('avatar/upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 2 },
      { name: 'background', maxCount: 2 },
    ]),
  )
  uploadFile(
    @UploadedFiles(new FileValidationPipe())
    files: {
      avatar?: Express.Multer.File[];
      background?: Express.Multer.File[];
    },
  ) {
    return files;
  }

  /**
   * avatar upload
   * @param user
   */
  @Post('file/upload')
  @UseInterceptors(FileInterceptor('file'))
  oneuploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.userService.uploadFile(file);
  }
}
