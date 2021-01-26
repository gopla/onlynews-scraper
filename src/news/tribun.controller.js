require('dotenv').config()
const puppeteer = require('puppeteer')
const News = require('./news.model')

let scrap = async (category) => {
	let topic = category
	const browser = await puppeteer.launch({ headless: true })
	const page = await browser.newPage()

	console.log(`Going To https://www.tribunnews.com/${category}`)

	await page.goto(`https://www.tribunnews.com/${category}`, {
		waitUntil: 'load',
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

	await browser.close().then(() => console.log('Scraping title finished . . .'))
	return data
}

let newsScrap = async () => {
	const browser = await puppeteer.launch({ headless: true })

	let _links = await News.find()
	for (const [index, ele] of _links.entries()) {
		await News.findOne(
			{
				link: ele.link,
			},
			async (err, isNewsExist) => {
				try {
					const page = await browser.newPage()

					if (!isNewsExist.news) {
						console.log(`Now going to : ${ele.link}?page=all`)
						await page.goto(`${ele.link}?page=all`, {
							waitUntil: 'load',
							timeout: 0,
						})

						console.log(` -> Reach the page , BEGIN SCRAPING ${ele.title}. . .`)
						let data = await page.evaluate(async () => {
							const imgEle = document.querySelector('.imgfull')

							const date = document.querySelector('time').innerText
							const image = imgEle ? imgEle.currentSrc : ' '

							let arrNews = Array.from(
								document.querySelectorAll('p'),
								(el) => el.innerText,
							)
							const news = arrNews.join(' ')
							return {
								date,
								image,
								news,
							}
						})
						await News.findOneAndUpdate(
							{ link: ele.link },
							{ $set: data },
							{ new: true, useFindAndModify: false },
						)
						console.log(` -> FINISHED , closing page ${ele.title}. . .`)
						await page.close()
					} else {
						console.log(` -> News in ${ele.title} is exist.`)
						await page.close()
					}
				} catch (error) {
					console.log(error)
				}
			},
		)
		console.log(index)
		if (index == _links.length - 1) {
			console.log(`Scraping end. . .`)
		}
	}
}

let getNewsIntoDB = async (category) => {
	let data = await scrap(category)
	console.log(data)
	try {
		News.insertMany(data, { ordered: false })
			.then(() => console.log(`${category} inserted`))
			.catch((e) => {
				console.log(e)
				console.log(`${category} inserted`)
			})
	} catch (e) {
		console.log(e)
		console.log(`${category} inserted`)
	}
}

module.exports = {
	getNewsIntoDB,
	newsScrap,
}
