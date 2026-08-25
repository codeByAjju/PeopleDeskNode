const validateRequest = (options) => async (request, response, next) => {
    try {
        await options.schema.validateAsync({
            ...request.query,
            ...request.body,
            ...request.params,
        });
        next();
    } catch (error) {
       next(error)
    }
}

export default validateRequest;

// const validateRequest = (options) => async (request, response, next) => {
//     try {
//         const { schema } = options;

//         if (!schema) {
//             return next(new Error("Validation schema is required"));
//         }

//         // Validate query
//         if (schema.query) {
//             request.query = await schema.query.validateAsync(request.query);
//         }

//         // Validate params
//         if (schema.params) {
//             request.params = await schema.params.validateAsync(request.params);
//         }

//         // Validate body
//         if (schema.body) {
//             request.body = await schema.body.validateAsync(request.body);
//         }

//         next();
//     } catch (error) {
//         next(error);
//     }
// };

// export default validateRequest;