const fs = require("fs");
const allSets = require("../constants");
const createDB = require("../createDB");

let cardsJson = {};

beforeAll(async () => {
  await createDB();
  cardsJson = JSON.parse(fs.readFileSync("./gameData/cards.json", "utf8"));
});

const testData = {
  id: 79416,
  pretty_name: "Arcane Signet",
  name: "arcane_signet",
  set: "ANB",
  isSecondaryCard: false,
  collectorNumber: "117",
  collectorMax: "118",
  type: ["Artifact"],
  subType: "",
  colors: [0, 0, 0, 0, 0],
  color_array: [0, 0, 0, 0, 0],
  color_identity: [],
  cost: ["2"],
  rarity: "Common",
};

test("Base cards are OK", () => {
  expect(cardsJson.cards[79416]).toStrictEqual(testData);
});

const testDataB = {
  id: 81938,
  pretty_name: "Celestial Vault",
  name: "celestial_vault",
  set: "Y22",
  digitalSet: "Y22-SNC",
  isSecondaryCard: false,
  collectorNumber: "1",
  collectorMax: "30",
  type: ["Artifact"],
  subType: "",
  colors: [1, 0, 0, 0, 0],
  color_array: [1, 0, 0, 0, 0],
  color_identity: ["W"],
  cost: ["1", "W"],
  rarity: "Uncommon",
};

test("Can identify digital cards", () => {
  // Celestial Vault
  expect(cardsJson.cards[81938]).toStrictEqual(testDataB);
});

const testDay = {
  id: 79412,
  pretty_name: "Day",
  name: "day",
  set: "MID",
  isSecondaryCard: true,
  collectorNumber: "19",
  collectorMax: "19",
  type: "",
  subType: "",
  colors: [0, 0, 0, 0, 0],
  color_array: [0, 0, 0, 0, 0],
  color_identity: [],
  cost: [],
  rarity: "Token",
};

test("Can handle extraneous tokens", () => {
  // Day token
  expect(cardsJson.cards[79412]).toStrictEqual(testDay);
});

test("Data integrity is OK", () => {
  expect(Object.keys(cardsJson.cards).length).toBe(11089);
});

test("We have all sets", () => {
  const sets = [];
  Object.values(cardsJson.cards).forEach((c) => {
    if (!sets.includes(c.set)) sets.push(c.set);
  });
  sets.sort();

  expect(allSets).toStrictEqual(sets);
});
