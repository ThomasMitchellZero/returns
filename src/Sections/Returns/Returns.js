import classes from "./Returns.module.css";
import { Outlet } from "react-router-dom";
import ProductContext from "../../store/product-context";
import InvoiceContext from "../../store/invoice-context";
import { useContext, useReducer } from "react";
import CartInvoMatcher from "./functions/CartInvoMatcher";
import cloneDeep from "lodash.clonedeep";

const Returns = () => {
  const productContext = useContext(ProductContext);
  const invoiceContext = useContext(InvoiceContext);

  // Generates a long list of numbers to test scrolling.
  const testDataMaker = (length) => {
    let output = [];
    for (let i = 0; i < length; i++) {
      output = [
        ...output,
        {
          id: i,
          content: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
          date: "5 August 1983",
        },
      ];
    }
    return output;
  };

  const testData = testDataMaker(55);

  //// RETURNS SESSION REDUCER ////

  const defaultSessionState = {
    items: {},
    invoices: {},
    unmatched: {},
    modified_invoices: {},
    matched: {},
    testData: testData,
  };

  const sessionReducer = (state, action) => {
    switch (action.type) {
      case "ADD_ITEM": {
        const newKey = action.payload.itemNum;
        const itemInfo = { ...productContext[newKey] };
        const sessionInvoices = { ...state.invoices };
        // if payload.quantity is undefined, return 0.  Dispositions will not include a quantity b/c qty isn't changing.
        let newQuantity = parseInt(action.payload.quantity ?? 0);
        // if item already exists, add old value to new value.
        newQuantity += state.items[newKey]?.quantity || 0

        // if there is a new disposition we need to completely replace the old disposition.
        const setDisposition =
          // Payload disposition if there is one
          action.payload.newDisposition ??
          // else existing disposition if there is one
          state.items[newKey]?.disposition ??
          // else an empty object.
          {};

        const newItemList = {
          ...state.items,
          [newKey]: {
            ...itemInfo,
            quantity: newQuantity,
            disposition: setDisposition,
          },
        };


        const derivedStates = CartInvoMatcher(newItemList, sessionInvoices);

        return {
          ...state,
          items: newItemList,
          ...derivedStates,
        };
      }

      case "REMOVE_ITEM": {
        const sessionInvoices = { ...state.invoices };
        let newItemList = { ...state.items };

        delete newItemList[action.payload];

        const derivedStates = CartInvoMatcher(newItemList, sessionInvoices);

        return {
          ...state,
          items: newItemList,
          ...derivedStates,
        };
      }

      case "ADD_INVOICE": {
        const sessionItems = { ...state.items };

        const invoicArr = action.payload;
        const newInvoiceList = {...state.invoices};

        //loop through the incoming array
        for (const i of invoicArr){
          //add this key and its properties from invoiceContext
          newInvoiceList[i] = invoiceContext[i]
        }

        const derivedStates = CartInvoMatcher(sessionItems, newInvoiceList);

        return {
          ...state,
          invoices: newInvoiceList,
          ...derivedStates,
        };
      }

      case "REMOVE_INVOICE": {
        const sessionItems = { ...state.items };
        let newInvoiceList = { ...state.invoices };
        delete newInvoiceList[action.payload];

        const derivedStates = CartInvoMatcher(sessionItems, newInvoiceList);

        return {
          ...state,
          invoices: newInvoiceList,
          ...derivedStates,
        };
      }

      case "CLEAR_SESSION":
        return defaultSessionState;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  };

  //// RETURNS SESSION STATE ////

  const [session, dispatchSession] = useReducer(
    sessionReducer,
    defaultSessionState
  );

  return (
    <main className={classes.container}>
      <Outlet
        context={{
          session: session,
          dispatchSession: dispatchSession,
        }}
      />
    </main>
  );
};

export default Returns;

/*









*/
