import { Application, Router } from "express";
import userController from "../controllers/user.controllers";

export default (app: Application): void => {
  const router = Router();

  router.get("/", userController.getAll);

  router.post("/", userController.create);

  router.post("/login", userController.login);

  router.delete("/:id", userController.remove);

  app.use("/api/users", router);
};
