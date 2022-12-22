import classes from "./ItemDetails30.module.css";

import TitleBar from "../../../components/UI/TitleBar";
import FooterContainer from "../../../components/UI/FooterContainer";

import disposSqueezer from "../functions/dispoSqueezer";

import { useReducer, useRef } from "react";

const ItemDetails30 = ({
  activeItem,
  dispatchActivePanels,
  returnsContext,
}) => {
  const sessionItem = returnsContext.session.items[activeItem];
  const dispatchSession = returnsContext.dispatchSession;

  // If the current item is deleted, send the user back to the Item Entry panel.
  if (!sessionItem)
    dispatchActivePanels({
      type: "SET_PANELS",
      payload: { set30: "item_entry" },
    });

  const refDispoObj = {
    doesntWork: 0,
    broken: 0,
    unpackaged: 0,
    used: 0,
    missingParts: 0,
    cosmetic: 0,
    warranty: 0,
  };

  const defaultState = {
    activeTab: "unwanted",
    defectiveReason: "doesntWork",
    inputValid: true,
    undamagedItems: sessionItem.quantity,
    localDisposObj: { ...sessionItem.disposition },
  };

  // Reducer to control which tab and which defective reason are active.
  const dispositionReducer = (state, action) => {
    switch (action.type) {
      case "SET_TAB": {
        return { ...state, activeTab: action.payload };
      }
      case "SET_ACTIVE_DISPO": {
        return { ...state, defectiveReason: action.payload.dispoType };
      }
      case "SET_EXCESS_ITEMS": {
        return { ...state, undamagedItems: action.payload };
      }
      case "EDIT_DISPOS_OBJ": {
        return { ...state, localDisposObj: action.payload };
      }
      case "SET_MULTIPLE": {
        return { ...state, ...action.payload };
      }
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  };

  const [detailsState, dispatchItemDetails] = useReducer(
    dispositionReducer,
    defaultState
  );

  const inputElement = useRef(null);

  // function to set dispositions upon button click.
  const handleDispoClick = (name) => {
    // focus on the input field
    inputElement.current.focus();

    dispatchItemDetails({
      type: "SET_MULTIPLE",
      payload: {
        localDisposObj: { ...sessionItem.disposition },
        defectiveReason: name,
        // invalid local inputs are never submitted to session state, so clones from Session are always valid.
        inputValid: true,
      },
    });
  };

  // reusable button to set item's dispositions
  const DispoButton = (label, reasonKey) => {
    const isActive = detailsState.defectiveReason === reasonKey ? "active" : "";
    return (
      <button
        type="button"
        onClick={() => {
          handleDispoClick(reasonKey);
        }}
        id={reasonKey}
        className={`baseButton secondary ${isActive}`}
      >
        {label}
      </button>
    );
  };

  // deal with changes to the input field
  const handleInputQty = (event) => {
    const rawIn = parseInt(event.target.value);

    // if input isn't a number, set it to 0.
    const inputQty = isNaN(rawIn) ? 0 : rawIn;

    // Each change to input is evaluated individually, so old value is moot.
    const keptDisposObj = { ...detailsState.localDisposObj };
    delete keptDisposObj[detailsState.defectiveReason];

    // Qty of all items besides this one.
    const keptQty = disposSqueezer(keptDisposObj).totalDispoQty;

    // Create new {dispo:value} unless inputQty is 0
    const newDispoProp =
      inputQty === 0 ? {} : { [detailsState.defectiveReason]: inputQty };

    // future payloads.  If input qty is valid, they get modified. Otherwise dispatched as is.
    const localPayload = {
      inputValid: false,
      undamagedItems: sessionItem.quantity - keptQty,
      localDisposObj: {
        ...keptDisposObj,
        ...newDispoProp,
      },
    };

    const sessionPayload = {
      itemNum: activeItem,
      // by default, obj does not include current item.  If qty is valid, new dispo: value is added before dispatch.
      newDisposition: keptDisposObj,
      inputQty: null,
    };

    // if sum of all dispos is correctly less that item total...
    if (keptQty + inputQty <= sessionItem.quantity) {

      //local
      localPayload.inputValid = true;
      localPayload.undamagedItems -= inputQty;

      //returns
      // Store validated dispo and qty in Session state.
      sessionPayload.newDisposition = {
        ...sessionPayload.newDisposition,
        ...newDispoProp,
      };
    }

    dispatchItemDetails({
      type: "SET_MULTIPLE",
      payload: {...localPayload},
    });

    dispatchSession({
      type: "ADD_ITEM",
      payload: {...sessionPayload},
    });
  };

  return (
    <section className={classes.container}>
      <TitleBar
        lefticon="close"
        left_onClick={() =>
          dispatchActivePanels({
            type: "SET_PANELS",
            payload: { set30: "item_entry" },
          })
        }
      >
        Item Details
      </TitleBar>
      <section className={classes.mainContent}>
        {/* Item Description */}
        <section className={classes.itemDescription}>
          <section className={classes.picAndQty}>
            <img src={sessionItem.img} alt="Product"></img>
            <div>
              <h5>Total Qty.</h5>
              <h2>{sessionItem.quantity}</h2>
            </div>
          </section>
          <div className={classes.itemCodes}>
            <h5>{`Item # ${sessionItem.itemNum}`}</h5>
            <div style={{ width: "0.75rem" }} />
            <h5>{`Model # ${sessionItem.modelNum}`}</h5>
          </div>
          <h4>{sessionItem.description}</h4>
        </section>

        {/* Return Reason Section */}
        <section className={classes.returnReason}>
          <p>Why is customer returning this item?</p>
          <section>
            <button
              type="button"
              className={`baseButton secondary ${
                detailsState.activeTab === "unwanted" ? "active" : ""
              }`}
              onClick={() => {
                dispatchItemDetails({
                  type: "SET_TAB",
                  payload: "unwanted",
                });
              }}
            >
              Didn't Want
            </button>
            <button
              type="button"
              className={`baseButton secondary ${
                detailsState.activeTab === "defective" ? "active" : ""
              }`}
              onClick={() => {
                dispatchItemDetails({
                  type: "SET_TAB",
                  payload: "defective",
                });
              }}
            >
              Damaged/Defective
            </button>
          </section>
          <div className="divider" />
        </section>

        {/* Disposition Section */}
        {detailsState.activeTab !== "defective" ? null : (
          <section className={classes.defectiveDispo}>
            {/* Title, Input Field, and warning message */}
            <section className={classes.dispo_descriptor}>
              <div>
                <p> Select item condition and enter quantity</p>
                <input
                  type="number"
                  disabled={false}
                  ref={inputElement}
                  className={`base_input`}
                  placeholder="Qty."
                  style={{ width: "4rem" }}
                  value={
                    detailsState.localDisposObj[detailsState.defectiveReason] ||
                    ""
                  }
                  onChange={handleInputQty}
                  onFocus={(event) => {
                    event.target.select();
                  }}
                />
              </div>
              <p className="warning-text">
                {detailsState.inputValid
                  ? ""
                  : `Item Total Exceeded.  Max value: ${detailsState.undamagedItems}`}
              </p>
            </section>

            {/* Disposition Buttons */}
            <section className={classes.dispoColumns}>
              <section>
                {DispoButton("Doesn't Work", "doesntWork")}
                {DispoButton("Broken", "broken")}
                {DispoButton("Out Of Package", "unpackaged")}
                {DispoButton("Warranty", "warranty")}
              </section>
              <section>
                {DispoButton("Missing Parts", "missingParts")}
                {DispoButton("Cosmetic", "cosmetic")}
                {DispoButton("Used", "used")}
              </section>
            </section>
          </section>
        )}
      </section>

      <FooterContainer>
        <button
          className={`baseButton primary large ${classes.continueButton}`}
        >
          Placeholder
        </button>
      </FooterContainer>
    </section>
  );
};

export default ItemDetails30;

/*



*/
