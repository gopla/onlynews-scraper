const puppeteer = require('puppeteer')
const News = require('../models/news.model')

async function scrapDetik(topic) {
	const browser = await puppeteer.launch({ headless: true })
	topic.forEach(async (topic) => {
		const page = await browser.newPage()

		console.log(`Going To https://${topic}.detik.com/`)

		await page.goto(`https://${topic}.detik.com/`, {
			waitUntil: 'load',
			timeout: 0,
		})

		let data = await page.evaluate((topic) => {
			if (topic == 'travel') {
				return Array.from(
					document.querySelectorAll('.list__news__content a'),
					(data) => ({
						link: data.href,
						title: data.text,
						topic: topic,
						publisher: 'Detik.com',
					}),
				)
			} else if (topic == 'health') {
				return Array.from(
					document.querySelectorAll('li article a'),
					(data) => ({
						link: data.href,
						title:
							data.querySelector('h2') == null
								? ''
								: data.querySelector('h2').innerText,
						topic: topic,
						publisher: 'Detik.com',
					}),
				)
			} else {
				return Array.from(
					document.querySelectorAll('.gtm_newsfeed_artikel .desc_nhl'),
					(data) => ({
						link: data.querySelector('a').href,
						title: data.querySelector('h2').innerText,
						topic: topic,
						publisher: 'Detik.com',
					}),
				)
			}
		}, topic)

		try {
			data.length = 5
			for (const isiData of data) {
				await page.goto(isiData.link + '?page=all', {
					waitUntil: 'networkidle0',
					timeout: 0,
				})
				let data = await page.evaluate(async (isiData) => {
					let imgEle = ''
					if (isiData.topic == 'travel') {
						imgEle = document.querySelector(
							'.img_con.lqd.imgLiquid_bgSize.imgLiquid_ready img',
						)
					} else if (isiData.topic == 'health') {
						imgEle = document.querySelector('.media_artikel.wide img')
					} else {
						imgEle = document.querySelector('.pic_artikel')
							? document.querySelector('.pic_artikel img')
							: document.querySelector('.p_img_zoomin.img-zoomin')
					}

					const date = document.querySelector('.date')
						? document.querySelector('.date').innerText
						: document.querySelector('.detail__date').innerText
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
						publisher: 'Detik.com',
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
	scrapDetik,
}
