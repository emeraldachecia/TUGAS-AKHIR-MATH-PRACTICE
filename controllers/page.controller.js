const responseHandler = require("../utils/response-handler");

class PageController {
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
}

module.exports = new PageController();