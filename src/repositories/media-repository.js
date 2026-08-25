import config from '../config/index.js';
import models from '../models/index.js';
import { Op } from 'sequelize';
const { media } = models;

export default {
    async saveMedia(req) {
        try {
            const { files, params } = req;
            const file = files[0];
            const basePath = `public/uploads/${params.mediaType}/${params.mediaFor}/${file.filename}`;
            const baseUrl = `${config.app.url}/${basePath}`
            const result = await media.create({
                name: file.filename,
                mediaType: params.mediaType,
                mediaFor: params.mediaFor,
                baseUrl,
                basePath
            })
            result.baseUrl = baseUrl;
            return { status: true, msg: 'Files Saved Successfully', result };
        } catch (err) {
            console.log(err);
            return { status: false, msg: 'Something went wrong !! Try again . . .' }
        }
    },
    async findMediaByBasePathAndUnlink(paths) {
        try {
            const where = { basePath: paths };
            const mediaData = await media.findOne({ where });
            if (mediaData) {
                await this.unlinkMedia(mediaData);
                await mediaData.update({ status: 'deleted' });
            }
            return true;
        } catch (error) {
            loggers.error(`Media find media by base path and unlink error: ${error}`);
            throw Error(error);
        }
    },

    async findAllByBasePathIn(paths) {
        try {
            const where = {
                status: 'pending',
                basePath: {
                    [Op.in]: paths,
                },
            };
            return await media.findAll({ where });
        } catch (error) {
            console.log(`Media find all by base path error: ${error}`);
            throw Error(error);
        }
    },
    async markMediaAsUsed(paths, t) {
        let transaction = '';
        if (t) {
            transaction = t;
        } else {
            transaction = await models.sequelize.transaction();
        }
        try {
            const mediaData = {
                status: 'used',
            };
            const result = await media.update(
                mediaData,
                {
                    where: {
                        basePath: {
                            [Op.in]: paths,
                        },
                    },
                },
                {
                    transaction,
                },
            );
            if (!t) {
                await transaction.commit();
            }
            return result;
        } catch (error) {
            if (!t) {
                await transaction.rollback();
            }
            throw Error(error);
        }
    },
}