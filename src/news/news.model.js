const { model, Schema } = require('mongoose')

module.exports = model(
	'News',
	new Schema(
		{
			link: {
				type: String,
				required: true,
				unique: true,
			},
			title: {
				type: String,
				required: true,
			},
			image: {
				type: String,
			},
			topic: {
				type: String,
				required: true,
			},
			publisher: {
				type: String,
				required: true,
			},
			date: {
				type: String,
			},
			news: {
				type: String,
			},
		},
		{
			collection: 'news',
			timestamps: true,
		},
	),
)
