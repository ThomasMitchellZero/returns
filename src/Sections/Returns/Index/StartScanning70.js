import classes from "./StartScanning70.module.css";

import ScanGraphic from "./ScanGraphic/ScanGraphic";
import FooterContainer from "../../../components/UI/FooterContainer";
import RefundTotal from "../../../components/UI/RefundTotal";

const StartScanning = ({ returnsContext = {} }) => {
  return (
    <main className={`${classes.container}`}>
      <section className={classes.mainContent}>
        <ScanGraphic
          graphic="Universal"
          mainText="Start Scanning"
          subText="You may scan or enter multiple receipts or items"
        ></ScanGraphic>
      </section>
      <FooterContainer>
        <RefundTotal dataObj={returnsContext} hideAdjust={false} />
      </FooterContainer>
    </main>
  );
};

export default StartScanning;

/*



*/
