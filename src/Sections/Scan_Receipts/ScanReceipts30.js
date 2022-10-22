import classes from "./ScanReceipts30.module.css";

import TitleBar from "../../components/UI/TitleBar";
import VerticalNavMenu from "../../components/UI/VerticalNavMenu";
import VerticalNavButton from "../../components/UI/VerticalNavButton";
import FooterContainer from "../../components/UI/FooterContainer";

import {
  ReceiptLineIcon,
  AddCartLineIcon,
  LookupLineIcon,
  SlashCashLineIcon,
  CloseLineIcon,
  ExchangeLineIcon,
  SlashCartLineIcon,
} from "../../assets/lowes-icons/Line-Icons/LineIcons";

const ScanReceipts30 = (props) => {
  return (
    <div className={`thirty_panel ${classes.scan_receipts_30}`}>
      <TitleBar>Actions</TitleBar>
      <VerticalNavMenu>
        <VerticalNavButton
          label="Receipt Entry"
          mainIcon={<ReceiptLineIcon className={classes.mainicon} />}
        />
        <VerticalNavButton
          label="Item Entry"
          mainIcon={<AddCartLineIcon className={classes.mainicon} />}
        />
        <VerticalNavButton
          label="Lookup"
          mainIcon={<LookupLineIcon className={classes.mainicon} />}
        />
        <VerticalNavButton
          label="No Sale"
          to="nosale"
          mainIcon={<SlashCashLineIcon className={classes.mainicon} />}
        />
        <VerticalNavButton
          label="Cancel Return"
          mainIcon={<CloseLineIcon className={classes.mainicon} />}
        />
        <VerticalNavButton
          label="Exchange"
          mainIcon={<ExchangeLineIcon className={classes.mainicon} />}
        />
        <VerticalNavButton
          label="Empty Cart"
          mainIcon={<SlashCartLineIcon className={classes.mainicon} />}
        />
      </VerticalNavMenu>
      <FooterContainer></FooterContainer>
    </div>
  );
};

export default ScanReceipts30;
