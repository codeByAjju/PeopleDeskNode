import Joi from 'joi';

const createSchema = Joi.object({
    employeeCode: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'any.required': 'EMPLOYEE_CODE_REQUIRED',
            'string.empty': 'EMPLOYEE_CODE_REQUIRED',
            'string.min': 'EMPLOYEE_CODE_MIN_VALIDATION',
            'string.max': 'EMPLOYEE_CODE_MAX_VALIDATION',
        }),

    firstName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'any.required': 'EMPLOYEE_FIRST_NAME_REQUIRED',
            'string.empty': 'EMPLOYEE_FIRST_NAME_REQUIRED',
            'string.min': 'EMPLOYEE_FIRST_NAME_MIN_VALIDATION',
            'string.max': 'EMPLOYEE_FIRST_NAME_MAX_VALIDATION',
        }),

    lastName: Joi.string()
        .max(50)
        .allow('', null)
        .messages({
            'string.max': 'EMPLOYEE_LAST_NAME_MAX_VALIDATION',
        }),

    email: Joi.string()
        .email()
        .max(100)
        .required()
        .messages({
            'any.required': 'EMPLOYEE_EMAIL_REQUIRED',
            'string.empty': 'EMPLOYEE_EMAIL_REQUIRED',
            'string.email': 'EMPLOYEE_EMAIL_INVALID',
            'string.max': 'EMPLOYEE_EMAIL_MAX_VALIDATION',
        }),

    phoneNumber: Joi.string()
        .max(20)
        .allow('', null)
        .messages({
            'string.max': 'EMPLOYEE_PHONE_NUMBER_MAX_VALIDATION',
        }),

    phoneNumberCountryCode: Joi.string()
        .max(10)
        .allow('', null)
        .messages({
            'string.max': 'EMPLOYEE_PHONE_COUNTRY_CODE_MAX_VALIDATION',
        }),

    dateOfBirth: Joi.date()
        .iso()
        .allow(null)
        .messages({
            'date.format': 'EMPLOYEE_DATE_OF_BIRTH_INVALID',
        }),

    gender: Joi.string()
        .valid('male', 'female', 'other', 'prefer_not_to_say')
        .allow(null)
        .messages({
            'any.only': 'EMPLOYEE_GENDER_INVALID',
        }),

    dateOfJoining: Joi.date()
        .iso()
        .required()
        .messages({
            'any.required': 'EMPLOYEE_DATE_OF_JOINING_REQUIRED',
            'date.format': 'EMPLOYEE_DATE_OF_JOINING_INVALID',
        }),

    dateOfLeaving: Joi.date()
        .iso()
        .allow(null)
        .messages({
            'date.format': 'EMPLOYEE_DATE_OF_LEAVING_INVALID',
        }),

    employmentType: Joi.string()
        .valid('full_time', 'part_time', 'contract', 'intern', 'temporary')
        .default('full_time')
        .messages({
            'any.only': 'EMPLOYEE_EMPLOYMENT_TYPE_INVALID',
        }),

    employmentStatus: Joi.string()
        .valid('active', 'on_leave', 'notice_period', 'resigned', 'terminated', 'inactive')
        .default('active')
        .messages({
            'any.only': 'EMPLOYEE_EMPLOYMENT_STATUS_INVALID',
        }),

    profileImage: Joi.string()
        .max(255)
        .allow('', null)
        .messages({
            'string.max': 'EMPLOYEE_PROFILE_IMAGE_MAX_VALIDATION',
        }),

    address: Joi.string()
        .allow('', null)
        .messages({
            'string.base': 'EMPLOYEE_ADDRESS_INVALID',
        }),

    countryId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_COUNTRY_ID_INVALID',
            'number.integer': 'EMPLOYEE_COUNTRY_ID_INVALID',
            'number.positive': 'EMPLOYEE_COUNTRY_ID_INVALID',
        }),

    stateId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_STATE_ID_INVALID',
            'number.integer': 'EMPLOYEE_STATE_ID_INVALID',
            'number.positive': 'EMPLOYEE_STATE_ID_INVALID',
        }),

    cityId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_CITY_ID_INVALID',
            'number.integer': 'EMPLOYEE_CITY_ID_INVALID',
            'number.positive': 'EMPLOYEE_CITY_ID_INVALID',
        }),

    postalCode: Joi.string()
        .max(20)
        .allow('', null)
        .messages({
            'string.max': 'EMPLOYEE_POSTAL_CODE_MAX_VALIDATION',
        }),

    departmentId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'EMPLOYEE_DEPARTMENT_ID_REQUIRED',
            'number.base': 'EMPLOYEE_DEPARTMENT_ID_INVALID',
            'number.integer': 'EMPLOYEE_DEPARTMENT_ID_INVALID',
            'number.positive': 'EMPLOYEE_DEPARTMENT_ID_INVALID',
        }),

    designationId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'EMPLOYEE_DESIGNATION_ID_REQUIRED',
            'number.base': 'EMPLOYEE_DESIGNATION_ID_INVALID',
            'number.integer': 'EMPLOYEE_DESIGNATION_ID_INVALID',
            'number.positive': 'EMPLOYEE_DESIGNATION_ID_INVALID',
        }),

    branchId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_BRANCH_ID_INVALID',
            'number.integer': 'EMPLOYEE_BRANCH_ID_INVALID',
            'number.positive': 'EMPLOYEE_BRANCH_ID_INVALID',
        }),

    locationId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_LOCATION_ID_INVALID',
            'number.integer': 'EMPLOYEE_LOCATION_ID_INVALID',
            'number.positive': 'EMPLOYEE_LOCATION_ID_INVALID',
        }),

    shiftId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_SHIFT_ID_INVALID',
            'number.integer': 'EMPLOYEE_SHIFT_ID_INVALID',
            'number.positive': 'EMPLOYEE_SHIFT_ID_INVALID',
        }),

    managerId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_MANAGER_ID_INVALID',
            'number.integer': 'EMPLOYEE_MANAGER_ID_INVALID',
            'number.positive': 'EMPLOYEE_MANAGER_ID_INVALID',
        }),

    userId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_USER_ID_INVALID',
            'number.integer': 'EMPLOYEE_USER_ID_INVALID',
            'number.positive': 'EMPLOYEE_USER_ID_INVALID',
        }),
});

const updateSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'EMPLOYEE_ID_REQUIRED',
            'number.base': 'EMPLOYEE_ID_INVALID',
            'number.integer': 'EMPLOYEE_ID_INVALID',
            'number.positive': 'EMPLOYEE_ID_INVALID',
        }),

    employeeCode: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'any.required': 'EMPLOYEE_CODE_REQUIRED',
            'string.empty': 'EMPLOYEE_CODE_REQUIRED',
            'string.min': 'EMPLOYEE_CODE_MIN_VALIDATION',
            'string.max': 'EMPLOYEE_CODE_MAX_VALIDATION',
        }),

    firstName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'any.required': 'EMPLOYEE_FIRST_NAME_REQUIRED',
            'string.empty': 'EMPLOYEE_FIRST_NAME_REQUIRED',
            'string.min': 'EMPLOYEE_FIRST_NAME_MIN_VALIDATION',
            'string.max': 'EMPLOYEE_FIRST_NAME_MAX_VALIDATION',
        }),

    lastName: Joi.string()
        .max(50)
        .allow('', null)
        .messages({
            'string.max': 'EMPLOYEE_LAST_NAME_MAX_VALIDATION',
        }),

    email: Joi.string()
        .email()
        .max(100)
        .required()
        .messages({
            'any.required': 'EMPLOYEE_EMAIL_REQUIRED',
            'string.empty': 'EMPLOYEE_EMAIL_REQUIRED',
            'string.email': 'EMPLOYEE_EMAIL_INVALID',
            'string.max': 'EMPLOYEE_EMAIL_MAX_VALIDATION',
        }),

    phoneNumber: Joi.string()
        .max(20)
        .allow('', null)
        .messages({
            'string.max': 'EMPLOYEE_PHONE_NUMBER_MAX_VALIDATION',
        }),

    phoneNumberCountryCode: Joi.string()
        .max(10)
        .allow('', null)
        .messages({
            'string.max': 'EMPLOYEE_PHONE_COUNTRY_CODE_MAX_VALIDATION',
        }),

    dateOfBirth: Joi.date()
        .iso()
        .allow(null)
        .messages({
            'date.format': 'EMPLOYEE_DATE_OF_BIRTH_INVALID',
        }),

    gender: Joi.string()
        .valid('male', 'female', 'other', 'prefer_not_to_say')
        .allow(null)
        .messages({
            'any.only': 'EMPLOYEE_GENDER_INVALID',
        }),

    dateOfJoining: Joi.date()
        .iso()
        .required()
        .messages({
            'any.required': 'EMPLOYEE_DATE_OF_JOINING_REQUIRED',
            'date.format': 'EMPLOYEE_DATE_OF_JOINING_INVALID',
        }),

    dateOfLeaving: Joi.date()
        .iso()
        .allow(null)
        .messages({
            'date.format': 'EMPLOYEE_DATE_OF_LEAVING_INVALID',
        }),

    employmentType: Joi.string()
        .valid('full_time', 'part_time', 'contract', 'intern', 'temporary')
        .messages({
            'any.only': 'EMPLOYEE_EMPLOYMENT_TYPE_INVALID',
        }),

    employmentStatus: Joi.string()
        .valid('active', 'on_leave', 'notice_period', 'resigned', 'terminated', 'inactive')
        .messages({
            'any.only': 'EMPLOYEE_EMPLOYMENT_STATUS_INVALID',
        }),

    profileImage: Joi.string()
        .max(255)
        .allow('', null)
        .messages({
            'string.max': 'EMPLOYEE_PROFILE_IMAGE_MAX_VALIDATION',
        }),

    address: Joi.string()
        .allow('', null)
        .messages({
            'string.base': 'EMPLOYEE_ADDRESS_INVALID',
        }),

    countryId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_COUNTRY_ID_INVALID',
            'number.integer': 'EMPLOYEE_COUNTRY_ID_INVALID',
            'number.positive': 'EMPLOYEE_COUNTRY_ID_INVALID',
        }),

    stateId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_STATE_ID_INVALID',
            'number.integer': 'EMPLOYEE_STATE_ID_INVALID',
            'number.positive': 'EMPLOYEE_STATE_ID_INVALID',
        }),

    cityId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_CITY_ID_INVALID',
            'number.integer': 'EMPLOYEE_CITY_ID_INVALID',
            'number.positive': 'EMPLOYEE_CITY_ID_INVALID',
        }),

    postalCode: Joi.string()
        .max(20)
        .allow('', null)
        .messages({
            'string.max': 'EMPLOYEE_POSTAL_CODE_MAX_VALIDATION',
        }),

    departmentId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'EMPLOYEE_DEPARTMENT_ID_REQUIRED',
            'number.base': 'EMPLOYEE_DEPARTMENT_ID_INVALID',
            'number.integer': 'EMPLOYEE_DEPARTMENT_ID_INVALID',
            'number.positive': 'EMPLOYEE_DEPARTMENT_ID_INVALID',
        }),

    designationId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'EMPLOYEE_DESIGNATION_ID_REQUIRED',
            'number.base': 'EMPLOYEE_DESIGNATION_ID_INVALID',
            'number.integer': 'EMPLOYEE_DESIGNATION_ID_INVALID',
            'number.positive': 'EMPLOYEE_DESIGNATION_ID_INVALID',
        }),

    branchId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_BRANCH_ID_INVALID',
            'number.integer': 'EMPLOYEE_BRANCH_ID_INVALID',
            'number.positive': 'EMPLOYEE_BRANCH_ID_INVALID',
        }),

    locationId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_LOCATION_ID_INVALID',
            'number.integer': 'EMPLOYEE_LOCATION_ID_INVALID',
            'number.positive': 'EMPLOYEE_LOCATION_ID_INVALID',
        }),

    shiftId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_SHIFT_ID_INVALID',
            'number.integer': 'EMPLOYEE_SHIFT_ID_INVALID',
            'number.positive': 'EMPLOYEE_SHIFT_ID_INVALID',
        }),

    managerId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_MANAGER_ID_INVALID',
            'number.integer': 'EMPLOYEE_MANAGER_ID_INVALID',
            'number.positive': 'EMPLOYEE_MANAGER_ID_INVALID',
        }),

    userId: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.base': 'EMPLOYEE_USER_ID_INVALID',
            'number.integer': 'EMPLOYEE_USER_ID_INVALID',
            'number.positive': 'EMPLOYEE_USER_ID_INVALID',
        }),
});

const statusSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'EMPLOYEE_ID_REQUIRED',
            'number.base': 'EMPLOYEE_ID_INVALID',
            'number.integer': 'EMPLOYEE_ID_INVALID',
            'number.positive': 'EMPLOYEE_ID_INVALID',
        }),

    employmentStatus: Joi.string()
        .valid('active', 'on_leave', 'notice_period', 'resigned', 'terminated', 'inactive')
        .required()
        .messages({
            'any.required': 'EMPLOYEE_EMPLOYMENT_STATUS_REQUIRED',
            'string.empty': 'EMPLOYEE_EMPLOYMENT_STATUS_REQUIRED',
            'any.only': 'EMPLOYEE_EMPLOYMENT_STATUS_INVALID',
        }),
});

const detailAndDeleteSchema = {
    params: Joi.object().keys({
        id: Joi.number()
            .integer()
            .greater(0)
            .required()
            .messages({
                'any.required': 'EMPLOYEE_ID_REQUIRED',
                'number.base': 'EMPLOYEE_ID_INVALID',
                'number.integer': 'EMPLOYEE_ID_INVALID',
                'number.greater': 'EMPLOYEE_ID_INVALID',
            }),
    }),
};

export default {
    createSchema,
    updateSchema,
    statusSchema,
    detailAndDeleteSchema,
};
