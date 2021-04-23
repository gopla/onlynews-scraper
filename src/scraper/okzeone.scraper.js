const puppeteer = require('puppeteer')
const News = require('../models/news.model')

async function scrapOkezone(topic) {
	// let topic = `news`
	const browser = await puppeteer.launch({ headless: true })
	topic.forEach(async (topic) => {
		const page = await browser.newPage()

		console.log(`Going To https://${topic}.okezone.com/`)

		await page.goto(`https://${topic}.okezone.com/`, {
			waitUntil: 'load',
			timeout: 0,
		})

		let data = await page.evaluate((topic) => {
			return Array.from(
				document.querySelectorAll('.wp-thumb-news a'),
				(data) => ({
					link: data.href.replace('page=1', 'page=all'),
					title: data.title,
					image: document.querySelector('.thumb-news.img-responsive.lazy')
						.dataset.original,
					topic: topic,
					publisher: 'Okezone.com',
				}),
			)
		}, topic)

		try {
			data.length = 5
			for (const isiData of data) {
				await page.goto(isiData.link + '?page=all', {
					waitUntil: 'networkidle0',
					timeout: 0,
				})
				let data = await page.evaluate(async (isiData) => {
					const imgEle = document.querySelector('#imgCheck')

					const date = document.querySelector('.namerep b').innerText
					const image = imgEle
						? imgEle.src
						: 'https://cdn.iconscout.com/icon/free/png-256/news-1661516-1410317.png'

					let arrNews = Array.from(
						document.querySelectorAll('p'),
						(el) => el.innerText,
					)
					const news = arrNews.join(' ')
					return {
						link: isiData.link,
						title: isiData.title,
						image: image,
						topic: isiData.topic == 'celebrity' ? 'seleb' : isiData.topic,
						publisher: 'Okezone.com',
						date: date,
						news: news,
					}
				}, isiData)
				try {
					await News.create(data)
					console.log(data.title + ' telah dimasukkan')
				} catch (error) {
					console.log('Berita sudah ada')
				}
			}
		} catch (error) {
			console.log(error)
		}
	})
	setTimeout(async () => {
		await browser.close()
	}, 600000)
}

module.exports = {
	scrapOkezone,
}
