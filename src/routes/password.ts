import { PasswordController } from "../controllers";
import { handleAuth } from "../middlewares/auth";
import { AppRoute } from "./router";

const passwordRoutes: AppRoute[] = [
  {
    method: "post",
    path: "/api/passwords/create",
    middleware: handleAuth,
    handler: (req, res) => new PasswordController("createPassword", req, res),
  },
  {
    method: "post",
    path: "/api/passwords/retrieve",
    middleware: handleAuth,
    handler: (req, res) => new PasswordController("retrievePassword", req, res),
  },
  {
    method: "get",
    path: "/api/passwords",
    middleware: handleAuth,
    handler: (req, res) => new PasswordController("getAll", req, res),
  },
  {
    method: "patch",
    path: "/api/passwords/update",
    middleware: handleAuth,
    handler: (req, res) => new PasswordController("updatePassword", req, res),
  },
  {
    method: "delete",
    path: "/api/passwords/delete",
    middleware: handleAuth,
    handler: (req, res) => new PasswordController("deletePassword", req, res),
  },
];

export default passwordRoutes;

// POST
// router.post(
//   "/api/passwords/create",
//   handleAuth,
//   (req, res) => new PasswordController("createPassword", req, res),
// );

// router.post(
//   "/api/passwords/retrieve",
//   handleAuth,
//   (req, res) => new PasswordController("retrievePassword", req, res),
// );

// GET
// router.get("/api/passwords", handleAuth, (req, res) => new PasswordController("getAll", req, res));

// DELETE
// router.delete(
//   "/api/passwords/delete",
//   handleAuth,
//   (req, res) => new PasswordController("deletePassword", req, res),
// );

// PATCH
// router.patch(
//   "/api/passwords/update",
//   handleAuth,
//   (req, res) => new PasswordController("updatePassword", req, res),
// );
