const userSchema = require("./user-schema");
const exerciseSchema = require("./exercise-schema");
const templateSchema = require("./template-schema");

module.exports = Object.assign({}, userSchema, exerciseSchema, templateSchema);