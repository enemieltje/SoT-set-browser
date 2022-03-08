import
{
	readHtmlFromUrl,
	removeWhitespace,
	formatLink,
	formatTitle,
	fixSrc
} from "./utils.ts";
import
{
	SetData,
	formatHtml,
	Cost,
	Item
} from "./format.ts";
/**
 * get an array of the html bits that are in each letter catagory
 */
function sortCatagories (cosmeticSetListHtml: string)
{
	cosmeticSetListHtml = removeWhitespace(cosmeticSetListHtml);

	// seperate into letter catagories
	const findLetters = new RegExp(`<h3>[A-Z]<\/h3>(<ul>.*?<\/ul>)`, "gm");
	// console.log(`flags: ${findLetters.flags}`);
	const perLetterArray = cosmeticSetListHtml.match(findLetters);
	if (perLetterArray == null)
	{
		console.log(`no letter cats found`);
		return;
	}
	console.log(`amount of letter cats found: ${perLetterArray.length}`);

	readList(perLetterArray);
}

/**
 * get SetInfo for each set in the list except the tables
 */
function readList (perLetterArray: RegExpMatchArray)
{
	// A record that contains the info for all the sets
	let cosmeticSetArray: SetData[] = [];

	// for each html bit that contains all sets starting with the same letter
	perLetterArray.forEach((letterCat) =>
	{
		// regex to find the link and title
		const findLink = /<li>.*?<a href="(.*?)"/gm;
		const findTitle = /title="(.*?)"/gm;

		// arrays that contain the links and titles for all sets with this letter
		const linkArrayPerLetter = letterCat.match(findLink);
		const tilteArrayPerLetter = letterCat.match(findTitle);

		if (linkArrayPerLetter == null || tilteArrayPerLetter == null)
		{
			console.log(`no links in this letter`);
			return;
		}


		// for each set with this letter
		for (let i = 0; i < linkArrayPerLetter.length; i++)
		{
			// construct SetInfo
			const tableInfo: SetData = {
				name: formatTitle(tilteArrayPerLetter[i]),
				relink: formatLink(linkArrayPerLetter[i]),
				ship: [],
				clothing: [],
				weapons: [],
				vanity: [],
				equipment: [],
				goldCoin: 0,
				ancientCoin: 0,
				doubloonsCoin: 0
			};

			// add the setinfo to the record
			cosmeticSetArray.push(tableInfo);
		}
	});
	console.log(`amount of links found: ${cosmeticSetArray.length}`);
	collectData(cosmeticSetArray);
}


/**
 * collects all the tables from the original pages
 * and starts constructing the html page when its done (could also be done with promise)
 */
function collectData (cosmeticSetRecord: SetData[])
{
	// counter to make sure we have done all of them
	// this is needed because the function is async
	let count = 0;

	cosmeticSetRecord.forEach(async (setData, i) =>
	{
		let sethtml = await readHtmlFromUrl(setData.relink);
		sethtml = removeWhitespace(sethtml);

		// get the table and write it to the record
		cosmeticSetRecord[i] = getTableFromPage(sethtml, setData);



		// if we are done with all of them we can construct the html
		count++;
		if (count == cosmeticSetRecord.length)
		{
			buildPage(cosmeticSetRecord);
		}
	});
}

function getTableFromPage (html: string, setData: SetData)
{
	const getTables = /<table class="wikitable.*?<\/table>/gm;
	const tables = html.match(getTables);

	tables?.forEach((v) =>
	{
		const title = getTitleFromTable(v, html);
		const items = getRowsFromTable(v, title);

		//console.log(title);
		switch (title)
		{
			case ("clothing"):
				setData.clothing = items;
				break;
			case ("vanity"):
				setData.vanity = items;
				break;
			case ("equipment"):
				setData.equipment = items;
				break;
			case ("weapons"):
				setData.weapons = items;
				break;
			case ("ship"):
				setData.ship = items;
				break;
		}
	});
	return setData;
}

function getTitleFromTable (table: string, html: string)
{
	const tableStart = html.indexOf(table);
	const preBit = html.slice(tableStart - 1000, tableStart);

	if (preBit.includes(`Clothing Items`))
		return "clothing";
	if (preBit.includes(`Vanity Items`))
		return "vanity";
	if (preBit.includes(`Equipment Items`))
		return "equipment";
	if (preBit.includes(`Weapons`))
		return "weapons";
	if (preBit.includes(`Ship Components`))
		return "ship";
}

function getRowsFromTable (table: string, type: string | undefined)
{
	if (!type) return [];

	const getRows = /<tr>.*?<\/tr>/gm;
	const rows = table.match(getRows);
	const items: Item[] = [];

	rows?.shift();
	rows?.forEach((v) =>
	{
		items.push(getDataFromRows(v, type));
	});

	return items;
}

function getDataFromRows (row: string, type: string)
{
	let item: Item = {
		type: type,
		img: "",
		name: "",
		goldCoin: 0,
		ancientCoin: 0,
		doubloonsCoin: 0,
	};

	const getHeaders = /<th.*?<\/th>/gm;
	const headers = row.match(getHeaders);

	if (headers)
	{
		// get the image
		const imageHeader = fixSrc(headers[0]);
		const srcIndex = imageHeader.indexOf("src");
		if (srcIndex > 0)
		{
			item.img = imageHeader.slice(srcIndex + 4).match(/".*?"/gm)![0].replaceAll("\"", "");
		}

		// get the name3
		const nameHeader = headers[1];
		const titleIndex = nameHeader.indexOf("title");
		if (titleIndex > 0)
		{
			item.name = nameHeader.slice(titleIndex).match(/".*?"/gm)![0].replaceAll("\"", "");
		}
	}

	// get cost
	const getBodies = /<td.*?<\/td>/gm;
	const tableBody = row.match(getBodies);

	if (tableBody)
	{
		const coins = tableBody[0];
		const getCoins = /span.*?>.*?title/gm;
		const coinsResults = coins.match(getCoins);

		if (coinsResults)
			coinsResults.forEach((coin) =>
			{
				const valueStart = coin.indexOf(">");
				const valueEnd = coin.indexOf("&");
				const value = coin.slice(valueStart + 1, valueEnd).replaceAll(",", "");

				if (coin.includes("Gold"))
				{
					item.goldCoin = Number.parseInt(value);
				}
			});
	}

	return item;
}

function buildPage (cosmeticSetArray: SetData[])
{
	Deno.writeTextFileSync("./dump.json", JSON.stringify(cosmeticSetArray, null, "\t"));
	// const index = formatHtml(cosmeticSetArray);
	// Deno.writeTextFileSync("./index.html", index);
}

const cosmeticSetUrl = "https://seaofthieves.fandom.com/wiki/Category:Cosmetic_Set";
sortCatagories(await readHtmlFromUrl(cosmeticSetUrl));
