import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class StorageService {
  private storage: AWS.S3;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.storage = new AWS.S3({
      accessKeyId: configService.get('spaces_access_key'),
      secretAccessKey: configService.get('spaces_secret_key'),
      endpoint: configService.get('spaces_endpoint'),
      region: configService.get('spaces_region'),
      s3ForcePathStyle: true,
    });
    this.bucketName = configService.get('spaces_bucket');
  }

  async uploadFile(file: any, folder: 'classifieds' | 'profiles' | 'categories' | 'locations' | 'brands' | 'models' | 'blogs' | 'banners'): Promise<any> {
    const params = {
      Bucket: this.bucketName,
      Key: `${folder}/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    try {
      const result = await this.storage.upload(params).promise();
      return {
        etag: result.ETag.replace(/"/g, ''),
        file: result.Key,
        url: result.Location,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return false;
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await this.storage.deleteObject(params).promise();
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

}
