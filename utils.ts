/**
 * returns a promise of the html content of a page
 */
export function readHtmlFromUrl (url: string): Promise<string>
{
	return new Promise<string>((resolve, _reject) =>
	{
		// console.log(`starting reading: ${url}`);
		// random code from interwebs
		let str = "";
		const arr: Uint8Array[] = [];
		fetch(url).then((response) =>
		{
			const reader = response?.body?.getReader();
			const _stream = new ReadableStream({
				start (controller)
				{
					// The following function handles each data chunk
					function push ()
					{
						// "done" is a Boolean and value a "Uint8Array"
						return reader?.read().then(({done, value}) =>
						{
							// console.log(`reader done: ${done}`);
							// console.log(`value: ${value}`);
							// Is there no more data to read?
							if (done)
							{
								// console.log(`finished reaing link`);
								// Tell the browser that we have finished sending data
								controller.close();
								str = decodeUintarr(arr);
								resolve(str);
								// writeDumpFile(arr);
								return;
							}
							// Get the data and send it to the browser via the controller
							if (value)
								arr.push(value);
							// controller.enqueue(value);
							push();
						});
					}
					push();
				}
			});
			// return new Response(_stream, {headers: {"Content-Type": "text/html"}});
			return;
		});
	});
}

/**
 * this is all the data that defines a cosmetic set
 */
export interface SetInfo
{
	title: string;
	link: string;
	table: string;
}

/**
 * removes tabs and newlines so regex can work with it
 */
export function removeWhitespace (str: string)
{
	return str.replace(/[\n\t]+/g, "");
}

export function formatTitle (str: string)
{
	return str.slice(7, -1);
}

export function formatLink (str: string)
{
	str = str.slice(13, -1);
	return `https://seaofthieves.fandom.com/${str}`;
}

/**
 * make sure the link that is included is correct
 */
export function fixSrc (html: string)
{
	// get the value of data-src
	const dataSrcIndex = html.indexOf("data-src");
	if (dataSrcIndex > 0)
	{
		const imageLink = html.slice(dataSrcIndex + 9).match(/".*?"/gm);
		if (!imageLink) return html;

		// substitute the value of data-src with the value of src
		const srcIndex = html.indexOf("src");
		if (srcIndex > 0)
		{
			const srcTrash = html.slice(srcIndex + 4).match(/".*?"/gm);
			if (!srcTrash) return html;
			html = html.replace(srcTrash[0], imageLink[0]);
			// console.log(`replaced ${srcTrash[0]} with ${imageLink[0]}`);
			//console.log(html);
		}
	}
	return html;
}

/**
 * decode an array of Uint8Arrays into a single string
 */
function decodeUintarr (arr: Uint8Array[])
{
	let str = "";
	arr.forEach((intarray) =>
	{
		const body = new TextDecoder().decode(intarray);
		str += body;
	});

	return str;
}
