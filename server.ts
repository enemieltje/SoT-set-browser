
async function handler ()
{
	const resp = await fetch("https://seaofthieves.fandom.com/wiki/Admiral_Set");

	if (!resp || !resp.body) return;
	const reader = resp.body.getReader();
	// const value = reader.read();
	// value.then(({done, value}) =>
	// {
	// 	if (done)
	// 	{

	// 		const body = new TextDecoder().decode(value);
	// 		Deno.writeFileSync("./dump.html", value!);
	// 		console.log("hi", body);
	// 	}
	// });
	let test = true;
	let intarray = new Uint8Array();

	while (test)
	{
		await reader.read().then(({done, value}) =>
		{

			const body = new TextDecoder().decode(value);
			Deno.writeFileSync("./dump.html", value!);
			console.log("hi", body);
			test = !done;

		});
	}
	// const body = new TextDecoder().decode(value);
	// Deno.writeFileSync("./dump.html", value!);
	// console.log("hi", body);
}
handler();

async function test ()
{

	const page = fetch("https://seaofthieves.fandom.com/wiki/Admiral_Set").then((response) =>
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
						// Is there no more data to read?
						if (done)
						{
							// Tell the browser that we have finished sending data
							controller.close();
							return;
						}

						// Get the data and send it to the browser via the controller
						controller.enqueue(value);
						push();
					});
				};

				push();
			}
		});

		return new Response(stream, {headers: {"Content-Type": "text/html"}});
	});

	// Deno.writeFileSync("./dump.html", await page);
	console.log("hi", page);

}
// test();
