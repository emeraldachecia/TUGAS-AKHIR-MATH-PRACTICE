const userSchema = require("./user-schema");
const exerciseSchema = require("./exercise-schema");


module.exports = Object.assign({}, userSchema, exerciseSchema);