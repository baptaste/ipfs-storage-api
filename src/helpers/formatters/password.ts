import {
  ClientPasswordPayload,
  Password,
  PasswordPayload,
} from "../../services/database/PasswordService";

export function formatPassword(password: Password, returnIpfs?: boolean): Password {
  let result: Password = {
    _id: password._id,
    description: password.description,
    encryption_id: password.encryption_id,
    email: password.email,
    owner_id: password.owner_id,
    created_at: password.created_at,
    displayed_name: password.displayed_name,
    image_url: password.image_url,
    title: password.title,
    updated_at: password.updated_at,
    website_url: password.website_url,
  };
  if (returnIpfs) {
    result = {
      ...result,
      ipfs: password.ipfs,
    };
  }
  return result;
}

export function getPasswordPayload(userId: string, data: ClientPasswordPayload): PasswordPayload {
  let payload: PasswordPayload = {
    owner_id: userId,
    encryption_id: data.encryptionId,
  };
  if (data.ipfsData) {
    payload = { ...payload, ipfs: data.ipfsData };
  }
  if (data.email) {
    payload = { ...payload, email: data.email };
  }
  if (data.description) {
    payload = { ...payload, description: data.description };
  }
  if (data.title) {
    payload = {
      ...payload,
      title: data.title,
      displayed_name: data.title,
    };
  }
  if (data.websiteUrl) {
    payload = { ...payload, website_url: data.websiteUrl };
  }
  if (data.imageUrl) {
    payload = { ...payload, image_url: data.imageUrl };
  }

  const displayedName = payload.title || payload.website_url || payload.email;
  payload = { ...payload, displayed_name: displayedName };

  return payload;
}
