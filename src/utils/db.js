require('dotenv').config()
const mongoose = require('mongoose')

const { CONNECTION_STRING } = process.env

const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
}

async function connectDB() {
	return mongoose.connect(CONNECTION_STRING, options)
}

mongoose.connection.on('error', function (error) {
	console.error('Database connection error:', error)
})

mongoose.connection.once('open', function () {
	console.log('Database connected:', CONNECTION_STRING)
})

module.exports = {
	connectDB,
}
