const sqlite3 = require("sqlite3");

const fs = require("fs");

async function convertSqlite() {
  const db = new sqlite3.Database("./gameData/Raw_CardDatabase.mtga");
  let converted = 0;

  return new Promise((resolve, reject) => {
    function checkAndClose() {
      converted += 1;
      if (converted === 3) {
        db.close();
        resolve();
      }
    }

    db.all(`SELECT * FROM "Localizations"`, {}, (a, b) => {
      fs.writeFileSync("./gameData/Raw_loc.json", JSON.stringify(b));
      checkAndClose();
    });

    db.all(`SELECT * FROM "Enums"`, {}, (a, b) => {
      fs.writeFileSync("./gameData/Raw_enums.json", JSON.stringify(b));
      checkAndClose();
    });

    db.all(`SELECT * FROM "Cards"`, {}, (a, b) => {
      fs.writeFileSync("./gameData/Raw_cards.json", JSON.stringify(b));
      checkAndClose();
    });
  });
}

module.exports = { convertSqlite };
