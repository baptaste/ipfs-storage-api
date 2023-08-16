import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { AppController } from "./AppController";
import NoteService, { ClientNotePayload } from "../services/database/NoteService";
import { IEncryptedData } from "../services/ipfs/types";
import { ipfsDelete, ipfsRetrieve, ipfsStore } from "../services/ipfs/service";
import { formatIpfsObject } from "../helpers/formatters/ipfs";

export class NoteController extends AppController {
  userId?: string;
  [method: string]: any;

  constructor(private method: string, private req: Request, private res: Response) {
    super();

    if (!req.user.userId) {
      this.unauthorized(res, "auth user id is required");
    } else {
      this.userId = req.user.userId;
      this.execute(req, res);
    }
  }

  protected async handler(req: Request, res: Response): Promise<void | any> {
    try {
      // handle requests, given through constructor in router
      await this[this.method](req, res);
    } catch (err: any) {
      console.error("NoteController - handler err:", err);
      return this.serverError(res, err.toString());
    }
  }

  private checkOwner(res: Response, noteRecord: any) {
    if (!this.userId) return;
    if (noteRecord.owner_id.toString() !== this.userId) {
      return this.unauthorized(res, `User with id ${this.userId} is not the owner`);
    }
  }

  public async getAll(_: any, res: Response) {
    if (!this.userId) return;
    const notes = await NoteService.getAll(this.userId);
    if (notes) {
      this.ok(res, { success: true, notes });
    }
  }

  public async createNote(req: Request, res: Response) {
    if (!this.userId) return;
    const { note, title } = req.body;
    if (!note) return this.clientError(res, "Note is required.");
    if (!title) return this.clientError(res, "Title is required.");
    // all data obj goes to ipfs, never stored into db
    const ipfsData: IEncryptedData = {
      encrypted: note.encrypted as Uint8Array,
      vector: note.vector as Uint8Array,
    };
    const ipfsResult = await ipfsStore(ipfsData);
    if (ipfsResult.cid) {
      console.log("createNote - ipfsResult:", ipfsResult);
      const ipfsData = formatIpfsObject(ipfsResult);
      // Create random uuid for the new note
      const encryptionId = uuid();
      const noteData: ClientNotePayload = {
        encryptionId,
        ipfsData,
        title,
      };
      // Create note in db
      const newNote = await NoteService.create(this.userId, noteData);
      if (!newNote) {
        // DB Error
        return this.ok(res, {
          success: false,
          note: null,
          message: "An error occurred while creating note",
        });
      }
      this.ok(res, { success: true, note: newNote });
    }
  }

  public async retrieveNote(req: Request, res: Response) {
    if (!this.userId) return;
    const { encryptionId } = req.body;
    if (!encryptionId) {
      return this.unauthorized(res, "note encryption id is required");
    }
    const noteRecord = await NoteService.getByEncryptionId(
      encryptionId,
      true, // access ipfs obj key
    );
    if (noteRecord && noteRecord.ipfs) {
      this.checkOwner(res, noteRecord);
      const ipfsResult = await ipfsRetrieve(noteRecord.ipfs.cid);
      console.log("retrieveNote - ipfsResult", ipfsResult);
      if (ipfsResult) {
        this.ok(res, { success: true, data: ipfsResult });
      }
    }
  }

  public async updateNote(req: Request, res: Response) {
    if (!this.userId) return;
    const { encryptionId, note, title } = req.body;
    console.log("updateNote - req.body", req.body);
    if (!encryptionId) {
      return this.unauthorized(res, "note encryption id is required");
    }
    if (!note && !title) {
      return this.clientError(res, "Either a note or title is required.");
    }
    const noteRecord = await NoteService.getByEncryptionId(encryptionId);

    if (noteRecord) {
      this.checkOwner(res, noteRecord);
      let updateType = "all";

      if (!note && title) {
        console.log("updateNote - TITLE UPDATE", title);
        updateType = "title";
      } else if (!title && note) {
        // ipfs update
        console.log("updateNote - NOTE UPDATE", note);
        updateType = "note";
      }
      const data: ClientNotePayload = {
        encryptionId,
        encryptedNote: note,
        title,
      };

      let payload: ClientNotePayload = { ...data };

      // encryption password update
      if (data.encryptedNote) {
        const ipfsPayload: IEncryptedData = {
          encrypted: data.encryptedNote.encrypted as Uint8Array,
          vector: data.encryptedNote.vector as Uint8Array,
        };
        const ipfsResult = await ipfsStore(ipfsPayload);
        if (ipfsResult.cid) {
          const ipfsData = formatIpfsObject(ipfsResult);
          // add new ipfs data to payload
          payload = { ...payload, ipfsData };
        }
      }

      const updatedNote = await NoteService.update(this.userId, payload);

      this.ok(res, {
        success: updatedNote != undefined,
        note: updatedNote,
        updateType,
      });
    }
  }

  public async deleteNote(req: Request, res: Response) {
    if (!this.userId) return;
    const { encryptionId } = req.body;
    if (!encryptionId) {
      return this.unauthorized(res, "note encryption id is required");
    }
    const noteRecord = await NoteService.getByEncryptionId(
      encryptionId,
      true, // access ipfs obj key
    );
    console.log("CONTROLLER - noteRecord", noteRecord);
    if (noteRecord && noteRecord.ipfs) {
      this.checkOwner(res, noteRecord);
      const ipfsResult = await ipfsDelete(noteRecord.ipfs.cid);
      if (!ipfsResult) {
        return this.ok(res, { success: false, deleted: false });
      }
      const dbSuccess = await NoteService.delete(noteRecord.encryption_id);
      if (dbSuccess) {
        this.ok(res, { success: true, deleted: true });
      }
    }
  }
}
