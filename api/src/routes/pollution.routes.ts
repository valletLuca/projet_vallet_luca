import { Application, NextFunction, Request, Response, Router } from "express";
import multer from "multer";
import pollutionController from "../controllers/pollution.controllers";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_PHOTO_BYTES,
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

  router.get("/", pollutionController.getAll);

  router.get("/:id", pollutionController.getById);

  router.post("/", parseForm, pollutionController.create);

  router.put("/:id", parseForm, pollutionController.update);

  router.delete("/:id", pollutionController.remove);

  app.use("/api/pollutions", router);
  app.use("/api/pollution", router);
};
