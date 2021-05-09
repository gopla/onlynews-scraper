const { connectDB } = require('./utils/db')
const { scrapTribun } = require('./scraper/tribun.scraper')
const { scrapOkezone } = require('./scraper/okzeone.scraper')
const { scrapDetik } = require('./scraper/detik.scraper')
const cron = require('node-cron')

connectDB()
	.then(async () => {
		console.log(` -> Database connected!`)
		// cron.schedule('0 12 * * *', async () => {
		await scrapDetik(['sport', 'health', 'travel'])
		await scrapTribun(['news', 'techno', 'seleb'])
		await scrapOkezone(['travel', 'news', 'celebrity'])
		// })
	})
	.catch((err) => console.log(err))
