import * as express from "express";

import authRoutes from "./auth";
import userRoutes from "./user";
import passwordRoutes from "./password";
import noteRoutes from "./note";

type HTTPMethod = "all" | "get" | "post" | "patch" | "delete";

export interface AppRoute {
  method: HTTPMethod;
  path: string;
  handler: express.RequestHandler;
  middleware?: express.RequestHandler;
}

type AppRoutes = Array<AppRoute[]>;

const routes: AppRoutes = [authRoutes, userRoutes, passwordRoutes, noteRoutes];
let httpMethod: HTTPMethod = "all";
const router = express.Router();

routes.forEach((routesHandler) => {
  routesHandler.forEach((route) => {
    switch (route.method) {
      case "get":
        httpMethod = "get";
        break;
      case "post":
        httpMethod = "post";
        break;
      case "patch":
        httpMethod = "patch";
        break;
      case "delete":
        httpMethod = "delete";
        break;
      default:
        break;
    }
    if (route.middleware) {
      router[httpMethod](route.path, route.middleware, route.handler);
    } else {
      router[httpMethod](route.path, route.handler);
    }
  });
});

export default router;

// type ApiRoutes = {
//   [key: string]: string;
// };

// const apiRoutes: ApiRoutes = {
//   auth: "/api/auth",
//   users: "/api/users",
//   passwords: "/api/passwords",
// };

//////////////////
// Auth routes //
//////////////////

// // POST
// router.post("/api/auth/login", (req, res) => new AuthController("login", req, res));
// // GET
// router.get(
//   "/api/auth/password/:email",
//   (req, res) => new AuthController("getMasterPassword", req, res),
// );
// router.get("/api/auth/logout", handleAuth, (req, res) => new AuthController("logout", req, res));
// router.get(
//   "/api/auth/refresh",
//   handleAuth,
//   (req, res) => new AuthController("refreshToken", req, res),
// );

//////////////////
// Users routes //
//////////////////

// // POST
// router.post("/api/users/create", (req, res) => new UserController("createUser", req, res));

// // GET

// ///// DEV ROUTE /////
// router.get("/api/users", handleAuth, (req, res) => new UserController("getAll", req, res));
// ///// END DEV ROUTE /////

// router.get("/api/users/:userId", handleAuth, (req, res) => new UserController("getUser", req, res));

// // PATCH
// router.patch(
//   "/api/users/update/password",
//   handleAuth,
//   (req, res) => new UserController("changePassword", req, res),
// );

// // DELETE
// router.delete(
//   "/api/users/delete/:userId",
//   handleAuth,
//   (req, res) => new UserController("deleteUser", req, res),
// );

//////////////////////
// Passwords routes //
//////////////////////

// // POST
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

// // GET
// router.get("/api/passwords", handleAuth, (req, res) => new PasswordController("getAll", req, res));

// // DELETE
// router.delete(
//   "/api/passwords/delete",
//   handleAuth,
//   (req, res) => new PasswordController("deletePassword", req, res),
// );

// // PATCH
// router.patch(
//   "/api/passwords/update",
//   handleAuth,
//   (req, res) => new PasswordController("updatePassword", req, res),
// );
