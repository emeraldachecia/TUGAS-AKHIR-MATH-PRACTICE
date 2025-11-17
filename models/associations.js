function applyAssociations(models) {
    const {
        UserModel,
        TemplateModel,
        ExerciseModel,
        QuestionModel,
        OptionModel,
    } = models;

    // asosiasi dengan User
    ExerciseModel.belongsTo(UserModel, {
        foreignKey: "user_id",
        targetKey: "user_id",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    });

    UserModel.hasMany(ExerciseModel, {
        foreignKey: "user_id",
        sourceKey: "user_id",
    });

    // asosiasi dengan Exercise
    QuestionModel.belongsTo(ExerciseModel, {
        foreignKey: "exercise_id",
        targetKey: "exercise_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    ExerciseModel.hasMany(QuestionModel, {
        foreignKey: "exercise_id",
        sourceKey: "exercise_id",
    });

    // asosiasi dengan Template
    QuestionModel.belongsTo(TemplateModel, {
		foreignKey: "template_id",
		targetKey: "template_id",
		onDelete: "RESTRICT",
		onUpdate: "CASCADE",
	});

	TemplateModel.hasMany(QuestionModel, {
		foreignKey: "template_id",
		sourceKey: "template_id",
    });
    
    // asosiasi dengan Question
    OptionModel.belongsTo(QuestionModel, {
        foreignKey: "question_id",
        targetKey: "question_id",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    });

    QuestionModel.hasMany(OptionModel, {
		foreignKey: "question_id",
		sourceKey: "question_id",
	});
}

module.exports = applyAssociations;