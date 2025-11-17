const UserModel = require("./user.model");
const TemplateModel = require("./template.model");
const ExerciseModel = require("./exercise.model");
const  QuestionModel = require("./question.model");
const OptionModel = require("./option.model");

const associations = require("./associations");

associations({
    UserModel,
    TemplateModel,
    ExerciseModel,
    QuestionModel,
    OptionModel,
}); 

module.exports = {
    UserModel,
    TemplateModel,
    ExerciseModel,
    QuestionModel,
    OptionModel,
};