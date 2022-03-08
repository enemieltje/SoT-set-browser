

function updateDump ()
{
	const arr: Uint8Array[] = [];
	fetch("https://seaofthieves.fandom.com/wiki/Category:Cosmetic_Set").then((response) =>
	{
		const reader = response?.body?.getReader();
		const stream = new ReadableStream({
			start (controller)
			{
				// The following function handles each data chunk
				function push ()
				{
					// "done" is a Boolean and value a "Uint8Array"
					return reader?.read().then(({done, value}) =>
					{
						console.log(`reader done: ${done}`);
						// console.log(`value: ${value}`);
						// Is there no more data to read?
						if (done)
						{
							// Tell the browser that we have finished sending data
							controller.close();
							writeDumpFile(arr);
							return;
						}

						// Get the data and send it to the browser via the controller
						if (value)
							arr.push(value);
						controller.enqueue(value);
						push();
					});
				};

				push();
			}
		});

		return new Response(stream, {headers: {"Content-Type": "text/html"}});
	});


}
function writeDumpFile (arr: Uint8Array[])
{
	let str = "";
	console.log("got arr", arr);
	arr.forEach((intarray) =>
	{
		const body = new TextDecoder().decode(intarray);
		str += body;
	});
	Deno.writeTextFileSync("./dump.html", str);
	console.log("done", str);
}
// updateDump();

function getNames (dump: string)
{
	// remove whitespaces
	const findWhitespace = /\s+/g;
	dump = dump.replace(findWhitespace, "");
	// console.log(`whitespace dump: ${dump}`);

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
	let linkArray: RegExpMatchArray = [];
	let titleArray: RegExpMatchArray = [];
	perLetterArray.forEach((letterCat) =>
	{
		// console.log(letterCat);
		const findLink = /<li><ahref="(.*?)"/gm;
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
		link = link.slice(12, -1);
		titleArray[i] = titleArray[i].slice(7, -1);
		linkArray[i] = `https://seaofthieves.fandom.com/${link}`;

		// console.log(`title: ${titleArray[i]}`);
		// console.log(`link: ${linkArray[i]}`);
	});

	// construct html page
	let index = `<!DOCTYPE html><html><body>`;
	linkArray.forEach((link, i) =>
	{
		index += `<a href="${linkArray[i]}">${titleArray[i]}</a><br>`;
		// 	<img src="https://static.wikia.nocookie.net/seaofthieves_gamepedia/images/a/aa/Admiral_Set_Galleon.png/revision/latest?cb=20200527180851" />

	});
	index += `</body></html>`;
	Deno.writeTextFileSync("./index.html", index);
}
getNames(Deno.readTextFileSync("./dump.html"));
/* getNames(`
											<div class="mw-category-group">
												<h3>A</h3>
												<ul>
													<li><a href="/wiki/Accomplished_Set"
															title="Accomplished Set">Accomplished Set</a></li>
													<li><a href="/wiki/Admiral_Set" title="Admiral Set">Admiral Set</a>
													</li>
													<li><a href="/wiki/Affiliate_Alliance_Set"
															title="Affiliate Alliance Set">Affiliate Alliance Set</a>
													<
															title="Azure Ocean Crawler Set">Azure Ocean Crawler Set</a>
													</li>
												</ul>
											</div>
<div class="mw-category-group">
												<h3>B</h3>
												<ul>
													<li><a href="/wiki/Bear_%26_Bird_Set"
															title="Bear &amp; Bird Set">Bear &amp; Bird Set</a></li>
													<li><a href="/wiki/Bedraggled_Castaway_Bilge_Rat_Set"
															title="Bedraggled Castaway Bilge Rat Set">Bedraggled
															Castaway Bilge Rat Set</a></li>
													<li><a href="/wiki/Bell_Brigade_Set" title="Bell Brigade Set">Bell
															Brigade Set</a></li>
												</ul>
											</div>`);
*/
