import multer from 'multer';
import { extname, join } from 'path';
import { Request } from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: join(__dirname, '../../uploads'),
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + extname(file.originalname));
  },
});

const allowedMimes = [
  'image/jpeg', 'image/png', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!allowedMimes.includes(file.mimetype)) {
      cb(new Error('Invalid file type. Allowed: JPEG, PNG, GIF, PDF, DOC, DOCX'));
      return;
    }
    cb(null, true);
  },
});
