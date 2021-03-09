const { connectDB } = require('./utils/db')
const { scrapTribun } = require('./scraper/tribun.scraper')
const { scrapOkezone } = require('./scraper/okzeone.scraper')

connectDB()
	.then(async () => {
		console.log(` -> Database connected!`)
    await scrapTribun(['news','techno','seleb'])
    await scrapOkezone(['travel','news','celebrity'])
	})
	.catch((err) => console.log(err))
