import { UserController } from "../controllers";
import { handleAuth } from "../middlewares/auth";
import { AppRoute } from "./router";

const userRoutes: AppRoute[] = [
  /* DEV ROUTE */
  {
    method: "get",
    path: "/api/users",
    middleware: handleAuth,
    handler: (req, res) => new UserController("getAll", req, res),
  },
  /* END DEV ROUTE */

  {
    method: "post",
    path: "/api/users/create",
    handler: (req, res) => new UserController("createUser", req, res),
  },
  {
    method: "get",
    path: "/api/users/:userId",
    middleware: handleAuth,
    handler: (req, res) => new UserController("getUser", req, res),
  },
  {
    method: "patch",
    path: "/api/users/update/password",
    middleware: handleAuth,
    handler: (req, res) => new UserController("changePassword", req, res),
  },
  {
    method: "delete",
    path: "/api/users/delete/:userId",
    middleware: handleAuth,
    handler: (req, res) => new UserController("deleteUser", req, res),
  },
];

export default userRoutes;

// POST
// router.post("/api/users/create", (req, res) => new UserController("createUser", req, res));

// GET

///// DEV ROUTE /////
// router.get("/api/users", handleAuth, (req, res) => new UserController("getAll", req, res));
///// END DEV ROUTE /////

// router.get("/api/users/:userId", handleAuth, (req, res) => new UserController("getUser", req, res));

// PATCH
// router.patch(
//   "/api/users/update/password",
//   handleAuth,
//   (req, res) => new UserController("changePassword", req, res),
// );

// DELETE
// router.delete(
//   "/api/users/delete/:userId",
//   handleAuth,
//   (req, res) => new UserController("deleteUser", req, res),
// );
