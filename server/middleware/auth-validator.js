const { check, validationResult } = require("express-validator");

// Register rules
exports.registerRules = () => [
  check("name", "name is required").notEmpty(),
  check("role", "role is required").notEmpty(),
  check("email", "email is required").notEmpty(),
  check("email", "check email again").isEmail(),
  check("password", "password must be between 6 and 20 characters").isLength({
    min: 6,
    max: 20,
  }),
  check("address", "address is required").notEmpty(),
  check("phoneNumber", "phone number is required").notEmpty(),
];

// Login rules
exports.loginRules = () => [
  check("email", "email is required").notEmpty(),
  check("email", "check email again").isEmail(),
  check("password", "password must be between 6 and 20 characters").isLength({
    min: 6,
    max: 20,
  }),
];

exports.Validation = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(400).send({
      errors: errors.array().map((el) => ({
        msg: el.msg,
      })),
    });
  }
  next();
};
