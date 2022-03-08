import {readHtmlFromUrl} from "./updateDump.ts";

function removeWhitespace (str: string)
{
	return str.replace(/[\n\t]+/g, "");
}

function getNames (dump: string)
{
	dump = removeWhitespace(dump);

	// seperate into letter catagories
	const findLetters = new RegExp(`<h3>[A-Z]<\/h3>(<ul>.*?<\/ul>)`, "gm");
	// console.log(`flags: ${findLetters.flags}`);
	const perLetterArray = dump.match(findLetters);
	if (perLetterArray == null)
	{
		console.log(`no letter cats found`);
		return;
	}
	console.log(`amount of letter cats found: ${perLetterArray.length}`);

	// get the set names of each letter cat
	const tableArray: string[] = [];
	let linkArray: RegExpMatchArray = [];
	let titleArray: RegExpMatchArray = [];
	perLetterArray.forEach((letterCat) =>
	{
		// console.log(letterCat);
		const findLink = /<li>.*?<a href="(.*?)"/gm;
		const findTitle = /title="(.*?)"/gm;
		const linkArrayPerLetter = letterCat.match(findLink);
		const tilteArrayPerLetter = letterCat.match(findTitle);
		if (linkArrayPerLetter == null || tilteArrayPerLetter == null)
		{
			console.log(`no links in this letter`);
			return;
		}
		// console.log(`linkArrayPerLetter: ${linkArrayPerLetter}`);
		linkArray = linkArray.concat(linkArrayPerLetter);
		titleArray = titleArray.concat(tilteArrayPerLetter);

	});
	console.log(`amount of links found: ${linkArray.length}`);

	// format links and titles
	linkArray.forEach((link, i) =>
	{
		link = link.slice(13, -1);
		titleArray[i] = titleArray[i].slice(7, -1);
		linkArray[i] = `https://seaofthieves.fandom.com/${link}`;

		// console.log(`title: ${titleArray[i]}`);
		// console.log(`link: ${linkArray[i]}`);
	});

	// construct html page
	let count = 0;
	// console.log(`length: ${linkArray.length}`);
	linkArray.forEach(async (link, i) =>
	{
		// console.log(`link: ${link}\ni: ${i}`);
		const table = await getTable(link);
		// console.log(`table: ${table}`);

		if (table)
			tableArray[i] = table;
		count++;
		if (count == linkArray.length)
			constructHtml(tableArray, linkArray, titleArray);
	});

}

function constructHtml (tableArray: string[], linkArray: string[], titleArray: string[])
{
	let index = `<!DOCTYPE html><html><body>`;

	tableArray.forEach((table, i) =>
	{
		index += `<a href="${linkArray[i]}">${titleArray[i]}</a><br>`;
		index += table;
		index += `<br>`;
	});

	console.log(`Done! writing to index`);
	index += `</body></html>`;
	Deno.writeTextFileSync("./index.html", index);
}

async function getTable (url: string)
{
	let sethtml = await readHtmlFromUrl(url);
	sethtml = removeWhitespace(sethtml);
	// Deno.writeTextFileSync("./dump.html", sethtml);
	const findTable = /<table class="infoboxtable">.*?<\/table>/gm;
	const tableResults = sethtml.match(findTable);
	if (!tableResults) return;
	let table = tableResults[0];

	table = formatTable(table);

	return table;
}

function formatTable (table: string)
{
	// if it has data-src
	const dataSrcIndex = table.indexOf("data-src");
	if (dataSrcIndex > 0)
	{
		// get link from data-src
		const imageLink = table.slice(dataSrcIndex + 9).match(/".*?"/gm);
		if (!imageLink) return table;
		// console.log(imageLink[0]);

		// substitute src with imageLink
		const srcIndex = table.indexOf("src");
		if (srcIndex > 0)
		{
			const srcTrash = table.slice(srcIndex + 4).match(/".*?"/gm);
			if (!srcTrash) return table;
			table = table.replace(srcTrash[0], imageLink[0]);
			// console.log(`replaced ${srcTrash[0]} with ${imageLink[0]}`);
			console.log(table);
		}

	}

	return table;
}

const cosmeticSetUrl = "https://seaofthieves.fandom.com/wiki/Category:Cosmetic_Set";
const cosmeticSetHtml = await readHtmlFromUrl(cosmeticSetUrl);
getNames(cosmeticSetHtml);

// const im = await getImageFromUrl(`https://seaofthieves.fandom.com/wiki/Mayhem_Set`);
// console.log(`image: ${im}`);
