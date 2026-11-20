import { DataTypes } from "sequelize";
import app from "./app";
import db from "./models";
import { SEED_POLLUTIONS } from "./models/seed";

// sync() ne crée que les tables absentes : une table déjà en place
// ne reçoit pas les colonnes ajoutées au modèle depuis.
async function addMissingColumns(): Promise<void> {
  const queryInterface = db.sequelize.getQueryInterface();
  const columns = await queryInterface.describeTable("pollution");
  if (!columns.danger_level) {
    await queryInterface.addColumn("pollution", "danger_level", {
      type: DataTypes.INTEGER,
      allowNull: true
    });
    console.log("Colonne danger_level ajoutée à la table pollution.");
  }
}

db.sequelize
  .sync()
  .then(addMissingColumns)
  .then(async () => {
    console.log("Synced db.");
    try {
      const count = await db.pollutions.count();
      if (count === 0) {
        await db.pollutions.bulkCreate(SEED_POLLUTIONS);
        console.log("Jeu de données initial pour la table pollution inséré avec succès.");
      }
    } catch (seedErr: unknown) {
      console.warn("Remarque : impossible d'insérer les données d'initialisation :", seedErr);
    }
  })
  .catch((err: Error) => {
    console.log("Failed to sync db: " + err.message);
  });

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}.`);
});

export default app;
