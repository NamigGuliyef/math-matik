import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudinaryResponse } from './cloudinary.response';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
    constructor(
        @Inject('CLOUDINARY') private cloudinary: any,
        private configService: ConfigService,
    ) { }

    uploadFile(file: any): Promise<CloudinaryResponse> {
        console.log('CloudinaryService.uploadFile started');

        const cloudName = this.configService.get('CLOUDINARY_NAME') || process.env.CLOUDINARY_NAME;
        const apiKey = this.configService.get('CLOUDINARY_API_KEY') || process.env.CLOUDINARY_API_KEY;
        const apiSecret = this.configService.get('CLOUDINARY_API_SECRET') || process.env.CLOUDINARY_API_SECRET;

        console.log('Using explicit config in upload call:', {
            hasCloudName: !!cloudName,
            hasApiKey: !!apiKey,
            hasApiSecret: !!apiSecret,
        });

        return new Promise<CloudinaryResponse>((resolve, reject) => {
            if (!file || !file.buffer) {
                console.error('File or buffer is missing');
                return reject(new Error('Fayl datası tapılmadı (buffer is missing)'));
            }

            const uploadStream = this.cloudinary.uploader.upload_stream(
                {
                    folder: 'math-matik',
                    resource_type: 'auto',
                    cloud_name: cloudName,
                    api_key: apiKey,
                    api_secret: apiSecret,
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary API Error Detail:', JSON.stringify(error));
                        return reject(error);
                    }
                    if (!result) {
                        return reject(new Error('Cloudinary-dən nəticə qayıtmadı'));
                    }
                    console.log('Cloudinary upload success:', result.secure_url);
                    resolve(result);
                },
            );

            try {
                streamifier.createReadStream(file.buffer).pipe(uploadStream);
            } catch (err) {
                console.error('Stream pipe error:', err);
                reject(err);
            }
        });
    }
}
