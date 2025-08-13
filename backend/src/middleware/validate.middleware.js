const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message.replace(/[\"\']/g, '')
      });
    }
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().min(2).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  event: Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    date: Joi.date().iso().required(),
    location: Joi.string().required(),
    price: Joi.number().min(0).required(),
    capacity: Joi.number().min(1).required(),
    category: Joi.string().required()
  }),
  
  payment: Joi.object({
    amount: Joi.number().min(1).required(),
    phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).required(),
    eventId: Joi.string().required()
  })
};

module.exports = {
  validateRequest,
  schemas
};