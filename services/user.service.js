const UserRepository = require("../repositories/user.repository");
const passwordHandler = require("../utils/password-handler");
const Connection = require("../configs/database.config");
const { filterHandler } = require("../utils/filter-handler");

class UserService {
    async find(data, type) {
        try {
            let result = {};

            const filters = filterHandler(data);
            
            switch (type) {
				case "summary":
					result = await UserRepository.findMany(filters);
					break;
				case "detail":
					result = await UserRepository.findOne(filters);
					break;
				default:
					throw new Error(`Unsupported type: ${type}`);
			}

			return result;
		} catch (error) {
			throw error;
		}
    }
}