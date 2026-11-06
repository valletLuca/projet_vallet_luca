import { PollutionCreationAttributes } from "./pollutions.model";

/** Jeu de données initial de la table pollution (le même que le backend simulé du Front). */
export const SEED_POLLUTIONS: PollutionCreationAttributes[] = [
  {
    title: "Sacs plastiques sur la plage du Prado",
    type: "plastique",
    description:
      "Une vingtaine de sacs et de bouteilles en plastique échoués en haut de plage après le coup de mistral, à proximité du poste de secours n° 3.",
    observedAt: "2026-10-18",
    place: "Marseille",
    latitude: 43.259724,
    longitude: 5.374963,
    createdAt: new Date("2026-10-18T09:12:00.000Z")
  },
  {
    title: "Irisations suspectes sur le canal",
    type: "eau",
    description:
      "Film huileux irisé sur environ 30 mètres le long de la berge, odeur d'hydrocarbure perceptible depuis la passerelle.",
    observedAt: "2026-10-15",
    place: "Strasbourg",
    latitude: 48.573405,
    longitude: 7.752111,
    createdAt: new Date("2026-10-15T16:40:00.000Z")
  },
  {
    title: "Dépôt de gravats en lisière de forêt",
    type: "depot-sauvage",
    description:
      "Plusieurs mètres cubes de gravats, plaques de plâtre et pots de peinture abandonnés sur le chemin forestier, au niveau de la barrière ONF.",
    observedAt: "2026-10-09",
    place: "Fontainebleau",
    latitude: 48.404676,
    longitude: 2.70162,
    createdAt: new Date("2026-10-10T07:55:00.000Z")
  },
  {
    title: "Fumées noires au-dessus de la zone industrielle",
    type: "air",
    description:
      "Panache de fumée noire et épaisse s'échappant d'une cheminée pendant plus d'une heure en fin de journée, visible depuis le périphérique.",
    observedAt: "2026-09-28",
    place: "Lyon",
    latitude: 45.722158,
    longitude: 4.832287,
    createdAt: new Date("2026-09-28T18:05:00.000Z")
  },
  {
    title: "Fûts de produits chimiques abandonnés",
    type: "chimique",
    description:
      "Quatre fûts métalliques rouillés avec étiquettes de danger, dont un fuit sur le sol. Le liquide est de couleur jaunâtre et dégage une odeur piquante.",
    observedAt: "2026-09-21",
    place: "Rouen",
    latitude: 49.431236,
    longitude: 1.072412,
    createdAt: new Date("2026-09-22T10:30:00.000Z")
  },
  {
    title: "Mousse blanche à la sortie du déversoir",
    type: "autre",
    description:
      "Mousse blanche persistante sur la rivière en aval du déversoir d'orage, sur une cinquantaine de mètres, après les fortes pluies de la nuit.",
    observedAt: "2026-09-12",
    place: "Nantes",
    latitude: 47.218371,
    longitude: -1.553621,
    createdAt: new Date("2026-09-12T08:20:00.000Z")
  }
];
