

function test ()
{
	const arr: Uint8Array[] = [];
	fetch("https://seaofthieves.fandom.com/wiki/Admiral_Set").then((response) =>
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
							writeFile(arr);
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
function writeFile (arr: Uint8Array[])
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
test();
