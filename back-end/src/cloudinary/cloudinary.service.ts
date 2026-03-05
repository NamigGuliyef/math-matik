import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary.response';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
    constructor(@Inject('CLOUDINARY') private cloudinaryConf: any) { }

    uploadFile(file: any): Promise<CloudinaryResponse> {
        console.log('CloudinaryService.uploadFile started');

        // Debug config (don't log secrets, just presence)
        const config = cloudinary.config();
        console.log('Cloudinary Config Check:', {
            hasCloudName: !!config.cloud_name,
            hasApiKey: !!config.api_key,
            hasApiSecret: !!config.api_secret,
        });

        return new Promise<CloudinaryResponse>((resolve, reject) => {
            if (!file || !file.buffer) {
                console.error('File or buffer is missing');
                return reject(new Error('Fayl datası tapılmadı (buffer is missing)'));
            }

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'math-matik',
                    resource_type: 'auto',
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
