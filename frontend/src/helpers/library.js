import wacarnolds from "../img/wacarnolds.webp";
import wacarnoldsLogo from "../img/wacarnoldsLogo.png";
import wacarnoldsBG from "../img/wacarnoldsBG.png";

import studio54 from "../img/studio54.png";
import studio54BG from "../img/studio54BG.png";

import importedOrgs from "./library.json";

const savedOrgs = importedOrgs.map((org) => {
  if (org.Name === "WacArnold's") {
    org.Img = wacarnolds;
    org.Logo = wacarnoldsLogo;
    org.BgImg = wacarnoldsBG;
  } else if (org.Name === "Studio 54") {
    org.Img = studio54;
    org.Logo = studio54;
    org.BgImg = studio54BG;
  }
  return org;
});

export { savedOrgs };
