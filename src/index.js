const { connectDB } = require('./utils/db')
const { getNewsIntoDB, newsScrap } = require('./news/tribun.controller')

connectDB()
	.then(() => {
		console.log(` -> Database connected!`)
		getNewsIntoDB('news').then(() =>
			newsScrap().then(() => {
				getNewsIntoDB('seleb').then(() =>
					newsScrap().then(() => {
						getNewsIntoDB('techno').then(() => newsScrap())
					}),
				)
			}),
		)
	})
	.catch((err) => console.log(err))
