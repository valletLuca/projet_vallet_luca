/** Configuration de production (`ng build`). */
export const environment = {
  production: true,
  // À ajuster quand l'API (dossier `api`) sera déployée sur Render.
  apiUrl: 'https://projet-vallet-luca-api.onrender.com/api',
  // Tant que l'API n'existe pas, les requêtes sont servies par le backend simulé.
  mockApi: true,
};
