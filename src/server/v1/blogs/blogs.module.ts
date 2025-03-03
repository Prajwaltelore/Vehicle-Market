import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blogs, BlogsSchema } from 'src/common/schemas/blogs.schema';
import { StorageService } from 'src/common/storage/storage.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blogs.name, schema: BlogsSchema },
    ]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, StorageService],
  exports: [BlogsService]
})
export class BlogsModule {}
