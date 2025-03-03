import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, map } from 'rxjs/operators';
import * as qs from 'qs';
import * as formData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';

import Mailgun from 'mailgun.js';
import { OtpVerification, OtpVerificationDocument } from '../schemas/otps.schema';
import { EmailTemplates, EmailTemplatesDocument } from '../schemas/emailtemplates.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {

    private mailgun;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        @InjectModel(OtpVerification.name) private otpModel: Model<OtpVerificationDocument>,
        @InjectModel(EmailTemplates.name) private emailTemplateModel: Model<EmailTemplatesDocument>,
    ) {
        const mailgun = new Mailgun(FormData);
        this.mailgun = mailgun.client({
            key: this.configService.get('mailgun_api_key'),
            username: this.configService.get('mailgun_username'),
        });
    }


    async createOtp(username: number, type: 'sms' | 'email'): Promise<OtpVerification> {
        let otp = Math.floor(1000 + Math.random() * 9000);
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 15); // Set expiry to 15 minutes from now

        const newOtp = new this.otpModel({
            username,
            otp,
            type,
            status: true,
            expiry,
        });

        return newOtp.save();
    }


    async validateOtp(mobile: number, otp: string): Promise<boolean> {
        const username = mobile.toString();
        const otpVerification = await this.otpModel.findOne({ username }).sort({ createdAt: -1 });

        if (!otpVerification) {
            return false;
        }

        // Type assertion to ensure TypeScript recognizes the isExpired method
        const typedOtpVerification = otpVerification as OtpVerificationDocument;

        if (typedOtpVerification.isExpired()) {
            return false; // OTP expired
        }

        if (otpVerification.otp == otp) {
            return true;
        }

        // Proceed with further validation if necessary
        return false; // OTP is valid and not expired
    }

    async sendSms(to: number, message: string) {
        const data = qs.stringify({
            module: 'TRANS_SMS',
            apikey: this.configService.get('two_factor_api_key'),
            to: to,
            from: 'SITSMS',
            msg: message,
        });

        let url = 'https://2factor.in/API/R1/';

        // this.httpService.post(url, data).pipe(
        //     map((response) => {
        //         if (response.data.Status == "Success") {
        //             return true;
        //         } else {
        //             return false;
        //         }
        //     })
        // ).toPromise();

        try {
            const response = await lastValueFrom(
                this.httpService.post(url, data).pipe(
                    map((res) => {
                        if (res.data.Status === 'Success') {
                            return true;
                        }
                        return true;
                    }),
                    catchError((error) => {
                        console.error('Error sending SMS:', error.message);
                        return [true]; // Default response on error
                    }),
                ),
            );
            return response;
        } catch (error) {
            console.error('Unhandled error:', error.message);
            return true; // Fallback in case of an unhandled error
        }
    }

    async sendOtp(to: number): Promise<any> {
        let otp = await this.createOtp(to, 'sms')
        const message = `Hi User, Your one time password for phone verification is ${otp.otp}`;
        return await this.sendSms(to, message);
    }

    async getTemplateByName(name: string, variables: { [key: string]: string }): Promise<{ body: string }> {
        const templatePath = path.join(process.cwd(), './src/common/emailtemplates', `${name}.html`);
        let template = fs.readFileSync(templatePath, 'utf8');

        if (!template) {
            throw new Error(`Email template with name "${name}" not found`);
        }

        const body = this.replaceTemplateVariables(template, variables);

        return { body };
    }

    private replaceTemplateVariables(template: string, variables: { [key: string]: string }): string {
        let populatedTemplate = template;
        for (const key in variables) {
            populatedTemplate = populatedTemplate.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
        }
        return populatedTemplate;
    }

    async sendEmail(
        to: string,
        subject: string,
        text: string,
    ): Promise<any> {
        try {
            const mailgun_domain = this.configService.get('mailgun_domain')
            const result = await this.mailgun.messages.create(mailgun_domain, {
                from: this.configService.get('mailgun_from_email'),
                to: [to],
                subject: subject,
                html: text,
            });
            if (result.status == true) {
                return true
            } else {
                return false
            }
        } catch (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    async accountVerificationEmail(username: string, token: string): Promise<any> {
        let link = this.configService.get('web_host');
        let appName = this.configService.get('app_name');
        const variables = {
            appname: appName,
            username: username,
            expiry: '1 Hour',
            verificationLink: link + 'auth/verify/email?token=' + token,
        };

        const { body } = await this.getTemplateByName('email-verification', variables);

        return await this.sendEmail(username, 'Account Verification', body);
    }
}