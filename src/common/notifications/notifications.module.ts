import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NotificationsService } from './notifications.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpVerification, OtpVerificationSchema } from '../schemas/otps.schema';
import { EmailTemplates, EmailTemplatesSchema } from '../schemas/emailtemplates.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OtpVerification.name, schema: OtpVerificationSchema },
      { name: EmailTemplates.name, schema: EmailTemplatesSchema },
    ]),
    HttpModule,
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
