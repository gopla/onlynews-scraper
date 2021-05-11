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
					link: data.href,
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
				console.log(isiData.link)
				await page.goto(isiData.link, {
					waitUntil: 'networkidle0',
					timeout: 0,
				})
				let data = await page.evaluate(async (isiData) => {
					try {
						imgEle = document.querySelector('#imgCheck')

						date = document.querySelector('.namerep b').innerText
						image = imgEle
							? imgEle.src
							: 'https://cdn.iconscout.com/icon/free/png-256/news-1661516-1410317.png'

						let str = Array.from(
							document.querySelectorAll('#contentx p'),
							(a) => {
								if (
									a.innerText.includes('Baca Juga') ||
									a.innerText.includes('Baca juga') ||
									a.innerText.includes('Lihat juga:')
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
						news = str
					} catch (error) {
						console.log('error Link : ' + isiData.link)
						console.log(error)
					}
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
	}, 300000)
}

module.exports = {
	scrapOkezone,
}
