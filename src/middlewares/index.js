import authValidateRequest from './auth-middleware.js';
import validateMiddleware from './validate-middleware.js';
import resourceAccessMiddleware from './resource-access-middleware.js';
import companyMiddleware from './company-middleware.js';
import mediaMiddleware from './media.middleware.js';
import departmentMiddleware from './department-middleware.js';
import designationMiddleware from './designation-middleware.js';
import geoMiddleware from './geo-middleware.js';
import branchMiddleware from './branch-middleware.js';
import locationMiddleware from './location-middleware.js';
import shiftMiddleware from './shift-middleware.js';
export default {
    authValidateRequest,
    validateMiddleware,
    resourceAccessMiddleware,
    companyMiddleware,
    mediaMiddleware,
    departmentMiddleware,
    designationMiddleware,
    geoMiddleware,
    branchMiddleware,
    locationMiddleware,
    shiftMiddleware,
};