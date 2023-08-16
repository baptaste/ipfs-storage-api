import { ClientNotePayload, Note, NotePayload } from "../../services/database/NoteService";

export function formatNote(password: Note, returnIpfs?: boolean): Note {
  let result: Note = {
    _id: password._id,
    encryption_id: password.encryption_id,
    owner_id: password.owner_id,
    created_at: password.created_at,
    title: password.title,
    updated_at: password.updated_at,
  };
  if (returnIpfs) {
    result = {
      ...result,
      ipfs: password.ipfs,
    };
  }
  return result;
}

export function getNotePayload(userId: string, data: ClientNotePayload): NotePayload {
  let payload: NotePayload = {
    owner_id: userId,
    encryption_id: data.encryptionId,
  };
  if (data.ipfsData) {
    payload = { ...payload, ipfs: data.ipfsData };
  }
  if (data.title) {
    payload = {
      ...payload,
      title: data.title,
    };
  }
  return payload;
}
