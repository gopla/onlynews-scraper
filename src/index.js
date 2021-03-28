const { connectDB } = require('./utils/db')
const { scrapTribun } = require('./scraper/tribun.scraper')
const { scrapOkezone } = require('./scraper/okzeone.scraper')
const { scrapDetik } = require('./scraper/detik.scraper')
const cron = require('node-cron')

connectDB()
	.then(async () => {
		console.log(` -> Database connected!`)
		cron.schedule('*/30 * * * *', async () => {
			await scrapTribun(['news', 'techno', 'seleb'])
			await scrapOkezone(['travel', 'news', 'celebrity'])
			await scrapDetik(['travel', 'health', 'sport'])
		})
	})
	.catch((err) => console.log(err))
