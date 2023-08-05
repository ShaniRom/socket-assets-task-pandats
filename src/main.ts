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

  let connectButton = document.getElementById("connectButton");
  connectButton?.addEventListener("click", function () {
    console.log("clicked connect");
    renderData(formattedSymbols);
    // Request symbol data updates
    // socket.emit('quotesSubscribe', {real: 0, reqId: parseInt(String(Math.random() * 9999))});
  });
});

// ----- the connect when pressed immediatly doesnt show the data fast need to fix that---SHANI

function renderData(formattedSymbols) {
  try{
    let rootPresentedData: any = document.querySelector("#rootPresentedData");

  let html = "";
  if (Array.isArray(formattedSymbols)) {
    console.log("Array recieved");
    formattedSymbols.forEach((cryptoData, key: Number) => {
       let fixedDigitDisplay =Number(cryptoData.Bid).toFixed(cryptoData.Digits);      
     
      html += `
       <div class="data"> 
       <h3 key=${key}> ${cryptoData.OutputName}</h3>
       <h3>${fixedDigitDisplay}</h3>
       </div>
       `;
    });

    rootPresentedData.innerHTML = html;
  } else {
    console.log("Array not recieved");
    html=`<div> </div>`
    rootPresentedData.innerHTML = html;
  }
  }catch(error){
    console.log(error)
  }
  
}

//////---- disconnect button

let disconnectButton = document.getElementById("disconnectButton");
disconnectButton?.addEventListener("click", function () {
  console.log("clicked disconnected");

  socket.disconnect();
  renderData("")
});
socket.on("disconnect", function(){
  console.log("client disconnected ");
});

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
