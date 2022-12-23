// Function for matching returned items with session invoices.

import cloneDeep from "lodash.clonedeep";
import disposSqueezer from "./dispoSqueezer";
import matchCostAdjuster from "./matchAdjuster";

const matchMaker = (itemList, invoiceList) => {
  //The three derived states we will create
  const modified_invoices = cloneDeep(invoiceList);
  const unmatched_items = cloneDeep(itemList);

  let matched_items = {};

  //loop through the Unmatched items.
  for (const itemNum of Object.keys(unmatched_items)) {
    // first, get sum of all disposition values for the current item.
    // AFAICT this is only used once so I can move it into the For loop.

    const thisCartItem = unmatched_items[itemNum];
    const itemRestockFee = thisCartItem.restockFee ?? 0;

    // use squeezer to generate a clean dispo obj and sum of its contents.
    const { dsQty: dispoTotal } = disposSqueezer(thisCartItem.disposition);

    // Calculate unwanted items
    const unwantedTotal = thisCartItem.quantity - dispoTotal;

    // If there is an UnwantedTotal, add it to the item's disposition.
    if (unwantedTotal > 0) thisCartItem.disposition.unwanted = unwantedTotal;

    // Each Matched item will contain an array of match objects.  Each match object will contain details of the invoice it matches from, as well as a dispos obj.
    let outMatchedItemObj = {
      specCategories: { ...thisCartItem.specialCategories },
      matches: [],
    };

    //loop through the Unmatched invoices ///////////////
    for (const invoiceNum of Object.keys(modified_invoices)) {
      const thisInvoice = modified_invoices[invoiceNum];
      const thisInvoItem = thisInvoice.products[itemNum];

      // If there are 0 unmatched units of item, move on to next item.
      if (!thisCartItem) break;
      // If this invoice doesn't contain this item, skip to next invoice.
      if (!thisInvoItem) continue;

      let outMatchedArrObj = {
        price: thisInvoItem.price,
        tax: thisInvoItem.tax,
        invoice: invoiceNum,
        disposition: {},
        totalPrice: 0,
        totalTax: 0,
        totalAdjustments: 0,
      };

      //loop through cart item's dispositions and subtract from Invoice item qty as matches are found.
      for (const loopDispo of Object.keys(thisCartItem.disposition)) {
        // check that item hasn't previously been deleted from invoice.
        if (!modified_invoices[invoiceNum].products[itemNum]) break;

        //quantities being compared
        const dispo_qty = thisCartItem.disposition[loopDispo];
        const sold_Qty = thisInvoItem.quantity;

        //The matched quantity is the smaller of the Qtys
        const matchedQty = Math.min(dispo_qty, sold_Qty);


        // subtract matchedQty from this InvoiceItem and the current dispo qty
        thisInvoItem.quantity -= matchedQty;
        thisCartItem.disposition[loopDispo] -= matchedQty

        // if either property is empty, delete it.
        if (thisInvoItem.quantity === 0){
          delete thisInvoice.products[itemNum];
        }
        if (thisCartItem.disposition[loopDispo] ===0){
          delete thisCartItem.disposition[loopDispo]
        }

        // add dispo:matchedQty to the outMatchedArrObj's dispositions
        outMatchedArrObj.disposition[loopDispo] = matchedQty;
        // decrement the TotalUnmatched
        thisCartItem.quantity -= matchedQty;

        //calculate total costs
        outMatchedArrObj.totalPrice += thisInvoItem.price * matchedQty;
        outMatchedArrObj.totalTax += thisInvoItem.tax * matchedQty;
        //restock fee only applies to unwanted items
        if (loopDispo === "unwanted"){
          outMatchedArrObj.totalAdjustments +=
          outMatchedArrObj.totalPrice * itemRestockFee;
        }


        // if there are no remaining umatched units...
        if (thisCartItem.quantity === 0) {
          // delete item from Unmatched
          delete unmatched_items[itemNum];
          // stop looping through the dispos, no more items to match.
          break;
        }
      } // end of loop through item dispositions. //////////////////

      // Each obj pushed itemNum's array details of the invoice on which the matches were found and contains all matched dispos

      // If Matched Items becomes an object, remember to add the key here.
      outMatchedItemObj.matches.push(outMatchedArrObj);
    } // end of loop through invoice keys ///////////////////////

    // this would be the other place to do the adjustment.  At this point I have the full object.

    outMatchedItemObj = matchCostAdjuster(outMatchedItemObj);

    // add the completed itemNum:[outMatchedItemObj] to {matched_items}
    if (outMatchedItemObj.matches.length > 0) {
      matched_items[itemNum] = outMatchedItemObj;
    }
  } // end of loop through unmatched items //////////////////

  return {
    matched: matched_items,
    unmatched: unmatched_items,
    modified_invoices: modified_invoices,
  };
};

export default matchMaker;

/*


  
*/

/*  THIS IS ALL TEST DATA
  
const itemsState = {
  100: {
    // more in invoice
    quantity: 4,
    disposition: {
      doesntWork: 0,
      broken: 2,
      unpackaged: 0,
      warranty: 2,
      missingParts: 0,
      cosmetic: 0,
      used: 0,
    },
  },
  200: {
    // more in scanned, match in second
    quantity: 12,
    disposition: {
      doesntWork: 5,
      broken: 5,
      unpackaged: 0,
      warranty: 2,
      missingParts: 0,
      cosmetic: 0,
      used: 0,
    },
  },
  300: {
    // equal in invoice
    quantity: 2,
    disposition: {
      doesntWork: 1,
      broken: 0,
      unpackaged: 0,
      warranty: 0,
      missingParts: 0,
      cosmetic: 0,
      used: 0,
    },
  },
  900: {
    // scanned > both invoices
    quantity: 5,
    disposition: {
      doesntWork: 0,
      broken: 0,
      unpackaged: 0,
      warranty: 2,
      missingParts: 0,
      cosmetic: 0,
      used: 0,
    },
  },

  910: {
    // no matches
    quantity: 5,
    disposition: {
      doesntWork: 1,
      broken: 0,
      unpackaged: 0,
      warranty: 0,
      missingParts: 0,
      cosmetic: 0,
      used: 0,
    },
  },
};

const invoiceState = {
  AAA: {
    invoiceDetails: {
      store: 1234,
      date: new Date(2022, 8, 13),
      payment: "cash",
    },
    products: {
      100: { quantity: 8, price: 44.15 },
      300: { quantity: 2, price: 24.15 },
      500: { quantity: 10, price: 13.15 },
      900: { quantity: 1, price: 876.15 },
    },
  },

  BBB: {
    invoiceDetails: {
      store: 1234,
      date: new Date(2022, 1, 22),
      payment: "check",
    },
    products: {
      200: { quantity: 8, price: 44.15 },
      900: { quantity: 1, price: 987.15 },
    },
  },
};
  
  */
