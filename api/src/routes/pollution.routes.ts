import { Application, NextFunction, Request, Response, Router } from "express";
import multer from "multer";
import pollutionController from "../controllers/pollution.controllers";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

// Le Front envoie un multipart (FormData) : champs texte + fichier `photo` optionnel.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_PHOTO_BYTES,
    // Lors d'une modification, une photo déjà importée revient en data URL dans `photoUrl`.
    fieldSize: Math.ceil(MAX_PHOTO_BYTES * 1.4)
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
  }
}).single("photo");

function parseForm(req: Request, res: Response, next: NextFunction): void {
  upload(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ message: `Photo refusée (${err.code}) : image de 5 Mo maximum attendue.` });
    } else if (err) {
      next(err);
    } else {
      next();
    }
  });
}

export default (app: Application): void => {
  const router = Router();

  // GET /api/pollutions
  router.get("/", pollutionController.getAll);

  // GET /api/pollutions/:id
  router.get("/:id", pollutionController.getById);

  // POST /api/pollutions
  router.post("/", parseForm, pollutionController.create);

  // PUT /api/pollutions/:id
  router.put("/:id", parseForm, pollutionController.update);

  // DELETE /api/pollutions/:id
  router.delete("/:id", pollutionController.remove);

  // Exposition sous /api/pollutions (utilisé par le Front) et /api/pollution (singulier)
  app.use("/api/pollutions", router);
  app.use("/api/pollution", router);
};
