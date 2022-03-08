import
{
	readHtmlFromUrl,
	SetInfo,
	removeWhitespace,
	formatLink,
	formatTitle,
	fixSrc
} from "./utils.ts";

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

	getInfo(perLetterArray);
}

/**
 * get SetInfo for each set in the list except the tables
 */
function getInfo (perLetterArray: RegExpMatchArray)
{
	// A record that contains the info for all the sets
	const cosmeticSetRecord: Record<string, SetInfo> = {};

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
		linkArrayPerLetter.forEach((link, i) =>
		{
			// construct SetInfo
			const tableInfo = {
				title: formatTitle(tilteArrayPerLetter[i]),
				link: formatLink(linkArrayPerLetter[i]),
				table: ""
			};

			// add the setinfo to the record
			cosmeticSetRecord[tilteArrayPerLetter[i]] = tableInfo;
		});
	});
	console.log(`amount of links found: ${Object.keys(cosmeticSetRecord).length}`);
	collectTables(cosmeticSetRecord);
}

/**
 * collects all the tables from the original pages
 * and starts constructing the html page when its done (could also be done with promise)
 */
function collectTables (cosmeticSetRecord: Record<string, SetInfo>)
{
	// counter to make sure we have done all of them
	// this is needed because the function is async
	let count = 0;

	Object.keys(cosmeticSetRecord).forEach(async (key, i) =>
	{
		// get the table and write it to the record
		const table = await getTable(cosmeticSetRecord[key].link, /<table class="infoboxtable">.*?<\/table>/gm);
		if (table) cosmeticSetRecord[key].table = table;

		// if we are done with all of them we can construct the html
		count++;
		if (count == Object.keys(cosmeticSetRecord).length)
			constructHtml(cosmeticSetRecord);
	});
}

/**
 * constructs a html page with all the info from the setRecord
 */
function constructHtml (cosmeticSetRecord: Record<string, SetInfo>)
{
	// the beginning of the html page
	let index = `<!DOCTYPE html><html><body>`;

	// the body of the html page
	Object.keys(cosmeticSetRecord).forEach((key, i) =>
	{
		// link to the original page
		index += `<a href="${cosmeticSetRecord[key].link}">${cosmeticSetRecord[key].title}</a><br>`;
		// the table
		index += cosmeticSetRecord[key].table + `<br>`;
	});

	// the end of the html page
	index += `</body></html>`;

	// save the file
	console.log(`Done! writing to index`);
	Deno.writeTextFileSync("./index.html", index);
}

/**
 * finds a table with regex in the html of a supplied url
 */
async function getTable (url: string, regex: RegExp)
{
	// get the html page
	let sethtml = await readHtmlFromUrl(url);
	sethtml = removeWhitespace(sethtml);

	// match the regex to find the table
	const tableResults = sethtml.match(regex);
	if (!tableResults) return;
	let table = tableResults[0];

	// format the table
	table = fixSrc(table);

	return table;
}

const cosmeticSetUrl = "https://seaofthieves.fandom.com/wiki/Category:Cosmetic_Set";
const cosmeticSetHtml = await readHtmlFromUrl(cosmeticSetUrl);
sortCatagories(cosmeticSetHtml);
// const dump = await readHtmlFromUrl(`https://seaofthieves.fandom.com//wiki/Admiral_Set`);
// Deno.writeTextFileSync("./dump.html", dump);
