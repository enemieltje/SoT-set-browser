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

function decodeUintarr (arr: Uint8Array[])
{
	let str = "";
	// console.log("got arr", arr);
	arr.forEach((intarray) =>
	{
		const body = new TextDecoder().decode(intarray);
		str += body;
	});

	// console.log("done", str.length);
	return str;
}
// const str = updateDump("https://seaofthieves.fandom.com/wiki/Category:Cosmetic_Set");

// console.log("done", await str);
