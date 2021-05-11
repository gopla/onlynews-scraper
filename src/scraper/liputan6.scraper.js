const puppeteer = require('puppeteer')
const News = require('../models/news.model')

async function scrapLiputan6(topic) {
	// let topic = `news`
	const browser = await puppeteer.launch({ headless: true })
	topic.forEach(async (topic) => {
		const page = await browser.newPage()

		console.log(`Going To https://www.liputan6.com/${topic}`)

		await page.goto(`https://www.liputan6.com/${topic}`, {
			waitUntil: 'networkidle0',
			timeout: 0,
		})

		let data = await page.evaluate((topic) => {
			return Array.from(
				document.querySelectorAll(
					'.articles--iridescent-list article.articles--iridescent-list--item.articles--iridescent-list--text-item h4 a',
				),
				(data) => ({
					link: data.href,
					title: data.innerText,
					topic,
					publisher: 'Liputan6.com',
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
					const imgEle = document.querySelector(
						'.read-page--photo-gallery--item__picture img',
					)

					const date = document.querySelector(
						'time.read-page--header--author__datetime.updated',
					).innerText
					const image = imgEle
						? imgEle.currentSrc
						: 'https://cdn.iconscout.com/icon/free/png-256/news-1661516-1410317.png'

					let str = Array.from(
						document.querySelectorAll('.article-content-body__item-page p'),
						(a) => {
							if (
								a.outerHTML.includes('baca juga') ||
								a.outerHTML.includes('baca-juga')
							) {
								return '<br />'
							} else if (a.outerHTML.includes('<a href')) {
								return '<p>' + a.innerText + '</p>'
							} else {
								return a.outerHTML
							}
						},
					)
					str = str.join('')
					const news = str
					return {
						link: isiData.link,
						title: isiData.title,
						image: image,
						topic:
							isiData.topic == 'bola'
								? (isiData.topic = 'sport')
								: isiData.topic == 'showbiz'
								? (isiData.topic = 'seleb')
								: isiData.topic,
						publisher: 'Liputan6.com',
						date: date,
						news: news,
					}
				}, isiData)
				try {
					await News.create(data)
					console.log(data.title + ' telah dimasukkan')
				} catch (error) {
					console.log(error)
					console.log('Berita sudah ada')
				}
			}
		} catch (error) {
			console.log(error)
		}
	})
	setTimeout(async () => {
		await browser.close()
	}, 300000)
}

module.exports = {
	scrapLiputan6,
}
