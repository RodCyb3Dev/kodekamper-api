const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});

		console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
	} catch (err) {
		console.error(`Error: ${err.message}`.red.underline.bold);
		// Exit process with failure
		process.exit(1);
	}
};

module.exports = connectDB;