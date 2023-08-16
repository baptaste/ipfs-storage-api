import Note from "../../models/Note";
import { formatNote, getNotePayload } from "../../helpers/formatters/note";
import { queryProjection } from "../../helpers/query";
import { IEncryptedData, IpfsDataType } from "../ipfs/types";

export interface Note {
  _id: string;
  encryption_id: string;
  owner_id: string;
  created_at: string;
  ipfs?: IpfsDataType;
  title?: string;
  updated_at?: string;
}

export interface NotePayload {
  encryption_id: string;
  owner_id: string;
  ipfs?: IpfsDataType;
  title?: string;
}

export interface ClientNotePayload {
  encryptionId: string;
  encryptedNote?: IEncryptedData;
  ipfsData?: IpfsDataType;
  title?: string;
}

export default class NoteService {
  static create(userId: string, data: ClientNotePayload): Promise<Note | null> {
    const payload = getNotePayload(userId, data);
    return new Promise((resolve, reject) => {
      // check if note already exists
      NoteService.getByEncryptionId(data.encryptionId)
        .then((record) => {
          if (record) {
            console.error(
              `NoteService - item already exists with encryptionId ${data.encryptionId}`,
            );
            resolve(null);
          } else {
            Note.create(payload)
              .then((note) => {
                console.log("NoteService - create note success");
                resolve(formatNote(note));
              })
              .catch((err) => {
                console.log("NoteService - create note error:", err);
                reject(err);
              });
          }
        })
        .catch((err) => {
          console.log("NoteService - create note error:", err);
          reject(err);
        });
    });
  }

  static getByEncryptionId(encryptionId: string, returnIpfs = false): Promise<Note | null> {
    // const ownerIdField: string = 'owner_id'
    return new Promise((resolve, reject) => {
      console.log("NoteService - get note with encryptionId:", encryptionId);
      Note.findOne()
        .where("encryption_id")
        .equals(encryptionId)
        .select(queryProjection([{ field: "ipfs", include: returnIpfs }]))
        .then((note) => {
          console.log("NoteService - getByEncryptionId, note:", note);
          resolve(note || null);
          // if (note !== null) resolve(note)
          // else reject('Note encryption_id does not exists')
        })
        .catch((err) => {
          console.log("NoteService - get note error:", err);
          reject(err);
        });
    });
  }

  static getAll(userId: string): Promise<Note[]> {
    return new Promise((resolve, reject) => {
      Note.find()
        .where("owner_id")
        .equals(userId)
        .select("-ipfs") // doesnt return ipfs obj
        .then((passwords) => {
          console.log("NoteService - get all passwords success");
          resolve(passwords);
        })
        .catch((err) => {
          console.log("NoteService - get all passwords error:", err);
          reject(err);
        });
    });
  }

  static update(userId: string, data: ClientNotePayload): Promise<Note> {
    const filter = { owner_id: userId, encryption_id: data.encryptionId };
    const payload = getNotePayload(userId, data);
    const update = { ...payload, updated_at: Date.now() };
    const options = { new: true }; // return updated doc

    return new Promise((resolve, reject) => {
      Note.findOneAndUpdate(filter, update, options)
        .then((note) => {
          console.log("NoteService - update note success, updated:", note);
          resolve(formatNote(note));
        })
        .catch((err) => {
          console.log("NoteService - update note error:", err);
          reject(err);
        });
    });
  }

  static updateLastModification(userId: string, encryptionId: string): Promise<Note> {
    const filter = { owner_id: userId, encryption_id: encryptionId };
    const update = { updated_at: Date.now() };
    const options = { new: true };

    return new Promise((resolve, reject) => {
      Note.findOneAndUpdate(filter, update, options)
        .then((note) => {
          console.log("NoteService - updateLastModification success");
          resolve(formatNote(note));
        })
        .catch((err) => {
          console.log("NoteService - updateLastModification error:", err);
          reject(err);
        });
    });
  }

  static delete(encryptionId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      Note.deleteOne()
        .where("encryption_id")
        .equals(encryptionId)
        .then((res) => {
          resolve(res.deletedCount === 1);
        })
        .catch((err) => {
          console.log("NoteService - delete note error:", err);
          reject(err);
        });
    });
  }

  static async deleteAll(userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      NoteService.count(userId)
        .then((passwordCount) => {
          console.log("NoteService deleteAll - passwordCount:", passwordCount);

          Note.deleteMany()
            .then((res) => {
              console.log("NoteService deleteAll - res.deletedCount:", res.deletedCount);
              resolve(res.deletedCount === passwordCount);
            })
            .catch((err) => {
              console.log("NoteService - delete all passwords error:", err);
              reject(err);
            });
        })
        .catch((err) => {
          console.error("NoteService count error:", err);
          reject(err);
        });
    });
  }

  static count(userId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      Note.count()
        .where("owner_id")
        .equals(userId)
        .then((count) => {
          console.log("NoteService - count success");
          resolve(count);
        })
        .catch((err) => {
          console.log("NoteService - count error:", err);
          reject(err);
        });
    });
  }
}
