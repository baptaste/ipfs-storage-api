import { AuthController } from "../controllers";
import { handleAuth } from "../middlewares/auth";
import { AppRoute } from "./router";

const authRoutes: AppRoute[] = [
  {
    method: "post",
    path: "/api/auth/login",
    handler: (req, res) => new AuthController("login", req, res),
  },
  {
    method: "get",
    path: "/api/auth/logout",
    middleware: handleAuth,
    handler: (req, res) => new AuthController("logout", req, res),
  },
  {
    method: "get",
    path: "/api/auth/refresh",
    middleware: handleAuth,
    handler: (req, res) => new AuthController("refreshToken", req, res),
  },
  {
    method: "get",
    path: "/api/auth/password/:email",
    handler: (req, res) => new AuthController("getMasterPassword", req, res),
  },
];

export default authRoutes;

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
