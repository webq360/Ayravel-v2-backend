
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinaryUpload } from './cloudinary.config';
import multer from 'multer';

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (req, file) => {
    const fileName = file.originalname
      .toLowerCase()
      .replace(/\s+/g, '-') 
      .replace(/\.[^.]*$/, '')
      .replace(/[^a-z0-9\-]/g, ''); 

    const uniqueFileName =
      Math.random().toString(36).substring(2) +
      '-' +
      Date.now() +
      '-' +
      fileName;

    const isPdf = file.mimetype === 'application/pdf';
    
    if (isPdf) {
      return {
        resource_type: 'raw' as any,
        public_id: `${uniqueFileName}.pdf`,
        folder: 'pdfs',
      };
    }
    
    return {
      resource_type: 'auto' as any,
      public_id: uniqueFileName,
    };
  },
});

// Cloudinary storage for direct upload (categories)
export const multerUpload = multer({ 
  storage: storage,
});

// Memory storage for manual buffer upload (brands, products)
export const multerMemory = multer({ 
  storage: multer.memoryStorage(),
});
