import { NoteController } from "../controllers";
import { handleAuth } from "../middlewares/auth";
import { AppRoute } from "./router";

const noteRoutes: AppRoute[] = [
  {
    method: "post",
    path: "/api/notes/create",
    middleware: handleAuth,
    handler: (req, res) => new NoteController("createNote", req, res),
  },
  {
    method: "post",
    path: "/api/notes/retrieve",
    middleware: handleAuth,
    handler: (req, res) => new NoteController("retrieveNote", req, res),
  },
  {
    method: "get",
    path: "/api/notes",
    middleware: handleAuth,
    handler: (req, res) => new NoteController("getAll", req, res),
  },
  {
    method: "patch",
    path: "/api/notes/update",
    middleware: handleAuth,
    handler: (req, res) => new NoteController("updateNote", req, res),
  },
  {
    method: "delete",
    path: "/api/notes/delete",
    middleware: handleAuth,
    handler: (req, res) => new NoteController("deleteNote", req, res),
  },
];

export default noteRoutes;
