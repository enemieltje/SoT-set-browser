export interface SetData extends Cost
{
	name: string;
	relink: string;
	ship: Array<Item>;
	clothing: Array<Item>;
	weapons: Array<Item>;
	vanity: Array<Item>;
	equipment: Array<Item>;
}
export interface Cost
{
	goldCoin: number;
	ancientCoin: number;
	doubloonsCoin: number;
}
export interface Item extends Cost
{
	type: string;
	name: string;
	img: string;
}

const goldCoinImg = "";
const ancientCoinImg = "";
const doubloonsCoinImg = "";

export function formatHtml (data: SetData[])
{
	const title = "sot set list";
	let body = `<html lang="en"><head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="style.css">
	<title>${title}</title></head><body>`;


	for (let i = 0; i < data.length; i++)
	{
		body += formatSetData(data[i]);
	}
	body += `</body></html>`;

	return body;
}

function formatSetData (setData: SetData)
{
	console.log("hi");

	setData = caltotalcoin(setData);
	//TODO:add collapse button
	let body = `<div id="${setData.name.replaceAll(" ", "")}" class="set">
 		<a class="name" href="${setData.relink}">${setData.name}</a>`;

	body += formatCost(setData);

	if (setData.ship[0]) body += formatItemList(setData.ship, "ship");
	if (setData.clothing[0]) body += formatItemList(setData.clothing, "clothing");
	if (setData.weapons[0]) body += formatItemList(setData.weapons, "weapons");
	if (setData.vanity[0]) body += formatItemList(setData.vanity, "vanity");
	if (setData.equipment[0]) body += formatItemList(setData.equipment, "equipment");
	body += "</div>";
	return body;
}

function formatCost (data: Cost)
{
	let body = "";
	if (data.goldCoin != 0) body += `<p class="cost">${data.goldCoin}${goldCoinImg}</p>`;
	if (data.ancientCoin != 0) body += `<p class="costAncient">${data.ancientCoin}${ancientCoinImg}</p>`;
	if (data.doubloonsCoin != 0) body += `<p class="costdoubloons">${data.doubloonsCoin}${doubloonsCoinImg}</p>`;
	return body;
}
function formatItem (data: Item)
{
	let body = `<div class="item ${data.type}">`;
	body += `<p class="name">${data.name}</p>`;
	body += formatCost(data);
	body += `<img src=${data.img}`;
	body += "</div>";
	return body;
}
function formatItemList (data: Array<Item>, type: string)
{
	let body = "";
	//TODO: add collapse button
	body += `<div class="imglist ${type}">`;
	for (let i = 0; i < data.length; i++)
	{
		body += formatItem(data[i]);

	}
	body += `</div>`;
	return body;
}


function caltotalcoin (data: SetData): SetData
{
	const cost: Cost = {
		goldCoin: 0,
		ancientCoin: 0,
		doubloonsCoin: 0
	};
	const loop = [data.ship, data.clothing, data.weapons, data.vanity, data.equipment];
	for (let j = 0; j < loop.length; j++)
	{
		for (let i = 0; i < loop[j].length; i++)
		{
			const item = loop[j][i];
			cost.goldCoin += item.goldCoin;
			cost.ancientCoin += item.ancientCoin;
			cost.doubloonsCoin += item.doubloonsCoin;
		}
	}

	data.goldCoin = cost.goldCoin;
	data.ancientCoin = cost.ancientCoin;
	data.doubloonsCoin = cost.doubloonsCoin;
	return data;

}
