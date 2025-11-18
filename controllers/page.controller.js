const responseHandler = require("../utils/response-handler");

class PageController {
	// HOME PAGE
    async home(req, res) {
       try {
			// if (req.session?.user) {
			// 	return res.redirect("/dashboard");
			// }

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
		// if (req.session?.user) {
		// 	return res.redirect("/dashboard");
		// }

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
}

module.exports = new PageController();