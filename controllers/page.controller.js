const responseHandler = require("../utils/response-handler");

class PageController {
	// HOME PAGE
    async home(req, res) {
       try {
			if (req.session?.user) {
				return res.redirect("/dashboard");
			}

			res.render("pages/home", {
				title: "Home",
				script: "home.js",
				style: "home.css",
				user: null,
			});
		} catch (error) {
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		} 
	}
	
	// LOGIN REGISTER PAGE
	async auth(req, res) {
		if (req.session?.user) {
			return res.redirect("/dashboard");
		}

		try {
			res.render("pages/auth", {
				title: "Auth",
				script: "auth.js",
				style: "auth.css",
				user: null,
			});
		} catch (error) {
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}

	// DASHBOARD
	async dashboard(req, res) {
		try {
			res.render("pages/dashboard", {
				title: "Dashboard",
				script: "dashboard.js",
				style: "dashboard.css",
				user: req.session.user,
			});
		} catch (error) {
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}

	// PROFILE
	async profile(req, res) {
		try {
			res.render("pages/profile", {
				title: "Profile",
				script: "profile.js",
				style: "profile.css",
				user: req.session.user,
			});
		} catch (error) {
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}

	// EXERCISE
	async exerciseSummary(req, res) {
		try {
			res.render("pages/exercise-summary", {
				title: "Exercise Summary",
				script: "exercise-summary.js",
				style: "exercise-summary.css",
				user: req.session.user,
			});
		} catch (error) {
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}

	async exerciseDetail(req, res) {
		try {
			res.render("pages/exercise-detail", {
				title: "Exercise Detail",
				script: "exercise-detail.js",
				style: "exercise-detail.css",
				user: req.session.user,
			});
		} catch (error) {
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}

	async exerciseForm(req, res) {
		try {
			res.render("pages/exercise-form", {
				title: "Exercise Form",
				script: "exercise-form.js",
				style: "exercise-form.css",
				user: req.session.user,
			});
		} catch (error) {
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}

	// USER
	async userSummary(req, res) {
		try {
			res.render("pages/user-summary", {
				title: "User Summary",
				script: "user-summary.js",
				style: "user-summary.css",
				user: req.session.user,
			});
		} catch (error) {
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}
	
	async userDetail(req, res) {
		try {
			res.render("pages/user-detail", {
				title: "User Detail",
				script: "user-detail.js",
				style: "user-detail.css",
				user: req.session.user,
			});
		} catch (error) {
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}

	async userForm(req, res) {
		try {
			res.render("pages/user-form", {
				title: "User Form",
				script: "user-form.js",
				style: "user-form.css",
				user: req.session.user,
			});
		} catch (error) {
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}

	// TEMPLATE
	async templateSummary(req, res) {
		try {
			res.render("pages/template-summary", {
				title: "Template Summary",
				script: "template-summary.js",
				style: "template-summary.css",
				user: req.session.user,
			});
		} catch (error) {
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}
	
	async templateDetail(req, res) {
		try {
			res.render("pages/template-detail", {
				title: "Template Detail",
				script: "template-detail.js",
				style: "template-detail.css",
				user: req.session.user,
			});
		} catch (error) {
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}

	async templateForm(req, res) {
		try {
			res.render("pages/template-form", {
				title: "Template Form",
				script: "template-form.js",
				style: "template-form.css",
				user: req.session.user,
			});
		} catch (error) {
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}
}


module.exports = new PageController();