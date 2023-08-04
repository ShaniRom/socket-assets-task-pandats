import "./style.css";
import { Socket } from "socket.io";
import * as io from "socket.io-client";

const socket: Socket = io("wss://panda-fx.pandats-client.io:443", {
  path: "/socket.io",
  transports: ["websocket"],
});

interface WidgetSymbol {
  id: number;
  Digits: number;
  OutputName: string;
  Bid: number;
  Category: string;
}

// ### Socket Events ###

/*
connect:
    Called when socket connected
*/
socket.on("connect", () => {
  console.log("Socket connected");

  // Request MT4GetAllSymbols - Get once A list of all available symbols
  // *reqId used to identify request on server side, can be any unique integer
  socket.emit("MT4GetAllSymbols", {
    reqId: parseInt(String(Math.random() * 9999)),
  });
});

/*
MT4GetAllSymbols:
    The response format is an array of symbols, with each symbol having several fields.
    For this task, only the following fields are relevant:
      1. id: symbol unique ID
      2. Digits: the number of digits to display after the decimal point
      3. OutputName: Symbol name to display
      4. Bid: the current price
      5. Category: Symbol category; please present only symbols from the "CRYPTO" category.
*/

socket.on("MT4GetAllSymbols", (data) => {
  // Example: how to filter data relevant for task
  let formattedSymbols: WidgetSymbol[] = data.Symbols.map((rawSymbol) => {
    let symbol: WidgetSymbol = {
      id: rawSymbol.id,
      Digits: rawSymbol.Digits,
      OutputName: rawSymbol.OutputName,
      Bid: rawSymbol.Bid,
      Category: rawSymbol.Category,
    };
    return symbol;
  }).filter((symbol) => symbol.Category === "CRYPTO");
  console.log(formattedSymbols);

  var connectButton = document.getElementById("connectButton");
  connectButton?.addEventListener("click", function () {
    console.log("clicked connect");
    renderData(formattedSymbols);
    // Request symbol data updates
    // socket.emit('quotesSubscribe', {real: 0, reqId: parseInt(String(Math.random() * 9999))});
  });
});

// ----- the connect when pressed immediatly doesnt show the data fast need to fix that---SHANI

function renderData(formattedSymbols) {
  let rootPresentedData:any = document.querySelector("#rootPresentedData");

  let html = "";
  formattedSymbols.forEach((cryptoData, key: Number) => {
    html += `
       <div > 
       <p class="data" key=${key} >${cryptoData.OutputName}<p>
       <div>
       `;

    let data:any = document.querySelector(".data");
    let odd=data.getAttribute("key")
    console.log(odd)
  });

  rootPresentedData.innerHTML = html;
}

//////---- disconnect button

/*
quotes:
    The response format is an array of arrays.
    Each response is a chunk of quote updates represented as an array:
      * item[0] - Asset ID - Matches symbol IDs as on MT4GetAllSymbols.
      * item[1] - Asset Bid - Updated price.

      The rest of the array is irrelevant for this task.
*/
// socket.on("quotes", updates => {
//     console.log(updates);
// });
