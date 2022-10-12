const fs = require("fs");
const path = require("path");

const { convertSqlite } = require("./convertSqlite.js");

function parseCost(cost) {
  return cost.split("o").slice(1, cost.length);
}

function cleanMtgaName(name) {
  let name_fixed = String(name).toLowerCase();
  name_fixed = name_fixed.replace(",", "");
  name_fixed = name_fixed.replace("-", " ");
  name_fixed = name_fixed.split(" ").join("_");
  return name_fixed;
}

function getColorArray(cost) {
  let colors = [0, 0, 0, 0, 0];
  let colorSymbols = ["W", "U", "B", "R", "G"];
  let cleanCost = cost;

  for (let i = 0; i < cleanCost.length; i++) {
    if (colorSymbols.includes(cleanCost[i])) {
      colors[colorSymbols.indexOf(cleanCost[i])] += 1;
    }
  }

  return colors;
}

// input array with one number of each of [1,5] for each color in colorIdentity
// output array with 1 or 0 indicating wether color is in colorIdentity
function getColorArrayFromColors(colorIdentity) {
  let colors = [0, 0, 0, 0, 0];
  colorIdentity.forEach((element) => {
    colors[element - 1] = 1;
  });
  return colors;
}

function parseStringArray(str) {
  return str.split(",");
}

async function createDB() {
  await convertSqlite();
  return new Promise((resolve) => {
    let colors = ["W", "U", "B", "R", "G"];

    let rarity = ["Token", "Basic", "Common", "Uncommon", "Rare", "Mythic"];

    // location of data files
    const data_folder = path.normalize("./gameData/");
    // defines where to find the info we need in locFile
    const enumFile = data_folder + "Raw_enums.json";
    // the data we actually need
    const locFile = data_folder + "Raw_loc.json";
    // all of the cards
    const cardsFile = data_folder + "Raw_cards.json";

    // target cardDb file
    const cardsOutputFile = "./gameData/cards.json";

    // Enums setup
    let enums = JSON.parse(fs.readFileSync(enumFile, "utf8"));

    let dataTypes = {};
    enums.forEach((en) => {
      if (!dataTypes[en.Type]) dataTypes[en.Type] = {};
      dataTypes[en.Type][en.Value] = en.LocId;
    });

    let locs = [];
    JSON.parse(fs.readFileSync(locFile, "utf8")).forEach((loc) => {
      // use only US loc data
      locs[loc.LocId] = loc.enUS;
    });

    function converCardObject(item) {
      const obj = {
        id: item.GrpId,
        pretty_name: locs[item.TitleId],
        name: cleanMtgaName(locs[item.TitleId]),
        set: item.ExpansionCode || undefined,
        digitalSet: item.DigitalReleaseSet,
        cmc: item.cmc,
        linkedFaceType: item.LinkedFaceType || undefined,
        linkedFaces: item.LinkedFaceGrpIds
          ? parseStringArray(item.LinkedFaceGrpIds)
          : undefined,
        isSecondaryCard: !!item.isPrimaryCard,
        collectorNumber: item.CollectorNumber || undefined,
        collectorMax: item.CollectorMax || undefined,
        type: parseStringArray(item.Types).map(
          (num) => locs[dataTypes["CardType"][num]]
        ),
        subType: parseStringArray(item.Subtypes).map(
          (num) => locs[dataTypes["SubType"][num]]
        ),
        colors: getColorArrayFromColors(
          item.ColorIdentity ? parseStringArray(item.ColorIdentity) : []
        ),
        color_array: getColorArray(
          item.OldSchoolManaText ? item.OldSchoolManaText : ""
        ),
        color_identity: getColorArrayFromColors(
          item.ColorIdentity ? parseStringArray(item.ColorIdentity) : []
        ).reduce((acc, cur, index) => {
          if (cur) {
            acc.push(colors[index]);
          }
          return acc;
        }, []),
        cost: parseCost(item.OldSchoolManaText ? item.OldSchoolManaText : ""),
        rarity: rarity[item.Rarity],
      };
      return obj;
    }

    // Process cards data
    let cards = JSON.parse(fs.readFileSync(cardsFile, "utf8")).reduce(
      (obj, item) => {
        if (item && item.ExpansionCode !== "ArenaSUP") {
          obj[item.GrpId] = converCardObject(item);
        }
        return obj;
      }
    );

    console.log("Writing cards to new file..");

    fs.writeFileSync(cardsOutputFile, JSON.stringify({ cards }, null, 2));

    console.log("Saved cards database OK");

    resolve();
  });
}

module.exports = createDB;
