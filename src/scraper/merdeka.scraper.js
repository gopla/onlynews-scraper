const puppeteer = require('puppeteer')
const News = require('../models/news.model')

async function scrapMerdeka(topic) {
	// let topic = `news`
	const browser = await puppeteer.launch({ headless: true })
	topic.forEach(async (topic) => {
		const page = await browser.newPage()

		console.log(`Going To https://www.merdeka.com/${topic}`)

		await page.goto(`https://www.merdeka.com/${topic}`, {
			waitUntil: 'networkidle0',
			timeout: 0,
		})

		let data = await page.evaluate((topic) => {
			return Array.from(
				document.querySelectorAll('.inner-content ul li.clearfix h3 a'),
				(data) => ({
					link: data.href,
					title: data.innerText,
					topic,
					publisher: 'Merdeka.com',
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
					const imgEle = document.querySelector('.mdk-dt-img img')

					const date = document.querySelector('.date-post').innerText
					const image = imgEle
						? imgEle.currentSrc
						: 'https://cdn.iconscout.com/icon/free/png-256/news-1661516-1410317.png'

					let str = Array.from(
						document.querySelectorAll('.mdk-body-paragraph p'),
						(a) => {
							if (a.outerHTML.includes('Baca juga:')) {
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
							isiData.topic == 'sehat'
								? (isiData.topic = 'health')
								: isiData.topic == 'teknologi'
								? (isiData.topic = 'techno')
								: isiData.topic,
						publisher: 'Merdeka.com',
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
	scrapMerdeka,
}
