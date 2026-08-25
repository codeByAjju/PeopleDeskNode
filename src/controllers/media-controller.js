import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import repositories from '../repositories/index.js';
import HttpStatus from 'http-status';
const { mediaRepository } = repositories;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { mediaType, mediaFor } = req.params;
        const dirPath = path.join(__dirname, '../../public/uploads', mediaType, mediaFor);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        cb(null, dirPath);
    },
    filename: (req, file, cb) => {
        const datetimestamp = Date.now();
        const filename = file.originalname.replace(/[^A-Z0-9.]/gi, '-');
        const fileArray = filename.split('.');
        const ext = fileArray.pop();
        cb(null, `${fileArray.join('-')}-${datetimestamp}.${ext}`);
    }
})

const upload = multer({
    storage,
    fileFilter: (req, file, callback) => {
        const ext = path.extname(file.originalname);
        let fileFormats = [];
        if (req.params.mediaType === 'image') {
            fileFormats = ['.png', '.jpg', '.gif', '.jpeg'];
        } else if (req.params.mediaType === 'video') {
            fileFormats = ['.mp4', '.mov', '.wmv', '.mp4'];
        } else if (req.params.mediaType === 'audio') {
            fileFormats = ['.aac', '.m4a', '.mp3'];
        } else if (req.params.mediaType === 'file') {
            fileFormats = ['.pdf', '.doc', '.docx'];
        } else if (req.params.mediaType === 'media') {
            fileFormats = [
                '.png',
                '.jpg',
                '.gif',
                '.aac',
                '.m4a',
                '.mp3',
                '.jpeg',
                '.pdf',
                '.doc',
                '.docx',
                '.mp4',
                '.mov',
                '.wmv',
                '.txt',
            ];
        }
        if (fileFormats.indexOf(ext.toLowerCase()) === -1) {
            return callback(
                new Error(`Allowed file format ${fileFormats.toString()}.`),
            );
        }
        callback(null, true);
    }
});

export default {
    uploadFile(req, res, next) {
       
        upload.any('file')(req, res, async (error) => {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    error.message = utility.getMessage(
                        req,
                        false,
                        'MEDIA_SIZE_VALIDATION',
                    );
                }
                error.status = HttpStatus.BAD_REQUEST;
                return next(error);
            }

            if (error) {
                // An unknown error occurred when uploading.
                error.status = HttpStatus.BAD_REQUEST;
                return next(error);
            }

            next();
        })
    },
    async saveFile(req, res, next) {
        try {
            const result = await mediaRepository.saveMedia(req);
            if (!result.status)
                throw new Error(result.msg);
            return res.status(HttpStatus.OK).json(result);

        } catch (err) {
            //console.log(next(err))
        }
    }
}