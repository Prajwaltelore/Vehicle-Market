import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../../../common/notifications/notifications.service';
import { UsersService } from './users.service';
import { StorageService } from 'src/common/storage/storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { UpdateUserDto } from './dtos/update-user.dto';

@ApiTags('Users Controller')
@Controller('v1/users')
// @ApiBearerAuth('JWT')
export class UsersController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  @Put('update-user')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.sub;
    return await this.usersService.update(userId, updateUserDto);
  }

  @Post('upload-profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadImage(@Req() req: any, @UploadedFile() file: any): Promise<any> {
    try {
      const userId = req.user.sub;

      // Upload the file to Contabo
      const uploadResult = await this.storageService.uploadFile(
        file,
        'profiles',
      );

      if (!uploadResult) {
        return {
          status: false,
          message: 'Profile Upload failed',
          data: null,
        };
      }
      // console.log(req.user);
      // console.log(userId);
      const image = this.configService.get('storage_link') + uploadResult.file;
      const updateResult = await this.usersService.updateImage(userId, image);

      if (!updateResult) {
        return {
          status: false,
          message: 'Failed to update user profile',
          data: null,
        };
      }

      return {
        status: true,
        message: 'File uploaded and user profile updated successfully',
        data: updateResult,
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        message: 'File upload failed',
        data: error,
      };
    }
  }

  @Delete('remove-profile')
  @UseGuards(JwtAuthGuard)
  async deleteImage(@Req() req: any): Promise<any> {
    const userId = req.user.sub;

    // console.log(req.user)
    return this.usersService.deleteImageById(userId);
  }
}
