import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const cloud_name =
      config.get('CLOUDINARY_NAME') || process.env.CLOUDINARY_NAME;
    const api_key =
      config.get('CLOUDINARY_API_KEY') || process.env.CLOUDINARY_API_KEY;
    const api_secret =
      config.get('CLOUDINARY_API_SECRET') || process.env.CLOUDINARY_API_SECRET;

    console.log('Provider Config Load:', {
      hasName: !!cloud_name,
      hasKey: !!api_key,
      hasSecret: !!api_secret,
    });

    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
    });

    return cloudinary;
  },
};
