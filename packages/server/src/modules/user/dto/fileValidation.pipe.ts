import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  // accept only image format
  private allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  private maxFileSize = 5000000; // 5MB

  private isFileTypeValid(file: Express.Multer.File): boolean {
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    return this.allowedExtensions.includes(fileExtension);
  }

  private isFileSizeValid(file: Express.Multer.File): boolean {
    return file.size <= this.maxFileSize;
  }
  // ------------------------------------------------------------
  transform(files: any) {
    const validatedFiles: any = {};

    for (const fieldname of Object.keys(files)) {
      validatedFiles[fieldname] = files[fieldname].filter((file) => {
        const isValid =
          this.isFileTypeValid(file) && this.isFileSizeValid(file);
        if (!isValid) {
          throw new BadRequestException(`Invalid file: ${file.originalname}`);
        }
        return true;
      });
    }

    return validatedFiles;
  }
}
