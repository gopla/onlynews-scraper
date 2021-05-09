const puppeteer = require('puppeteer')
const News = require('../models/news.model')

async function scrapTribun(topic) {
	// let topic = `news`
	const browser = await puppeteer.launch({ headless: true })
	topic.forEach(async (topic) => {
		const page = await browser.newPage()

		console.log(`Going To https://www.tribunnews.com/${topic}`)

		await page.goto(`https://www.tribunnews.com/${topic}`, {
			waitUntil: 'networkidle0',
			timeout: 0,
		})

		let data = await page.evaluate((topic) => {
			return Array.from(
				document.querySelectorAll('.fr.mt5.pos_rel a'),
				(data) => ({
					link: data.href,
					title: data.title,
					image: document.querySelector('.shou2.bgwhite').currentSrc,
					topic: topic,
					publisher: 'Tribunnews.com',
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
					const imgEle = document.querySelector('.imgfull')

					const date = document.querySelector('time').innerText
					const image = imgEle
						? imgEle.currentSrc
						: 'https://cdn.iconscout.com/icon/free/png-256/news-1661516-1410317.png'

					let str = Array.from(
						document.querySelectorAll('.side-article.txt-article p'),
						(a) => {
							if (a.outerHTML.includes('<a href')) {
								return '<p>' + a.innerText + '</p>'
							} else if (!a.outerHTML.includes('Baca juga:')) {
								return a.outerHTML
							} else {
								return '<br />'
							}
						},
					)
					str = str.join('')
					const news = str
					return {
						link: isiData.link,
						title: isiData.title,
						image: image,
						topic: isiData.topic,
						publisher: 'Tribunnews.com',
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
	scrapTribun,
}
