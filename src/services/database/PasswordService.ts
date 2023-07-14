import { formatPassword, getPasswordPayload } from "../../helpers/formatters/password";
import { queryProjection } from "../../helpers/query";
import Password from "../../models/Password";
import { IEncryptedData, IpfsDataType } from "../ipfs/types";

export interface Password {
  _id: string;
  encryption_id: string;
  displayed_name: string;
  owner_id: string;
  created_at: string;
  email?: string;
  description?: string;
  image_url?: string;
  ipfs?: IpfsDataType;
  title?: string;
  updated_at?: string;
  website_url?: string;
}

export interface PasswordPayload {
  encryption_id: string;
  owner_id: string;
  email?: string;
  description?: string;
  displayed_name?: string;
  image_url?: string;
  ipfs?: IpfsDataType;
  title?: string;
  website_url?: string;
}

export interface ClientPasswordPayload {
  encryptionId: string;
  encryptedPassword?: IEncryptedData;
  email?: string;
  description?: string;
  displayedName?: string;
  imageUrl?: string;
  ipfsData?: IpfsDataType;
  title?: string;
  websiteUrl?: string;
}

export default class PasswordService {
  static create(userId: string, data: ClientPasswordPayload): Promise<Password | null> {
    const payload = getPasswordPayload(userId, data);
    return new Promise((resolve, reject) => {
      // check if password already exists
      PasswordService.getByEncryptionId(data.encryptionId)
        .then((record) => {
          if (record) {
            console.error(
              `PasswordService - item already exists with encryptionId ${data.encryptionId}`,
            );
            resolve(null);
          } else {
            Password.create(payload)
              .then((password) => {
                console.log("PasswordService - create password success");
                resolve(formatPassword(password));
              })
              .catch((err) => {
                console.log("PasswordService - create password error:", err);
                reject(err);
              });
          }
        })
        .catch((err) => {
          console.log("PasswordService - create password error:", err);
          reject(err);
        });
    });
  }

  static getByEncryptionId(encryptionId: string, returnIpfs = false): Promise<Password | null> {
    // const ownerIdField: string = 'owner_id'
    return new Promise((resolve, reject) => {
      console.log("PasswordService - get password with encryptionId:", encryptionId);
      Password.findOne()
        .where("encryption_id")
        .equals(encryptionId)
        .select(queryProjection([{ field: "ipfs", include: returnIpfs }]))
        .then((password) => {
          console.log("PasswordService - getByEncryptionId, password:", password);
          resolve(password || null);
          // if (password !== null) resolve(password)
          // else reject('Password encryption_id does not exists')
        })
        .catch((err) => {
          console.log("PasswordService - get password error:", err);
          reject(err);
        });
    });
  }

  static getAll(userId: string): Promise<Password[]> {
    return new Promise((resolve, reject) => {
      Password.find()
        .where("owner_id")
        .equals(userId)
        .select("-ipfs") // doesnt return ipfs obj
        .then((passwords) => {
          console.log("PasswordService - get all passwords success");
          resolve(passwords);
        })
        .catch((err) => {
          console.log("PasswordService - get all passwords error:", err);
          reject(err);
        });
    });
  }

  static update(
    userId: string,
    data: ClientPasswordPayload,
    // encryptionId: string,
    // data: {
    //   displayed_name?: string;
    //   image_url?: string;
    //   ipfs?: IpfsDataType;
    //   title?: string;
    //   website_url?: string;
    // },
  ): Promise<Password> {
    const filter = { owner_id: userId, encryption_id: data.encryptionId };
    const payload = getPasswordPayload(userId, data);
    const update = { ...payload, updated_at: Date.now() };
    const options = { new: true }; // return updated doc

    return new Promise((resolve, reject) => {
      Password.findOneAndUpdate(filter, update, options)
        .then((password) => {
          console.log("PasswordService - update password success, updated:", password);
          resolve(formatPassword(password));
        })
        .catch((err) => {
          console.log("PasswordService - update password error:", err);
          reject(err);
        });
    });
  }

  static updateLastModification(userId: string, encryptionId: string): Promise<Password> {
    const filter = { owner_id: userId, encryption_id: encryptionId };
    const update = { updated_at: Date.now() };
    const options = { new: true };

    return new Promise((resolve, reject) => {
      Password.findOneAndUpdate(filter, update, options)
        .then((password) => {
          console.log("PasswordService - updateLastModification success");
          resolve(formatPassword(password));
        })
        .catch((err) => {
          console.log("PasswordService - updateLastModification error:", err);
          reject(err);
        });
    });
  }

  static delete(encryptionId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      Password.deleteOne()
        .where("encryption_id")
        .equals(encryptionId)
        .then((res) => {
          resolve(res.deletedCount === 1);
        })
        .catch((err) => {
          console.log("PasswordService - delete password error:", err);
          reject(err);
        });
    });
  }

  static async deleteAll(userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      PasswordService.count(userId)
        .then((passwordCount) => {
          console.log("PasswordService deleteAll - passwordCount:", passwordCount);

          Password.deleteMany()
            .then((res) => {
              console.log("PasswordService deleteAll - res.deletedCount:", res.deletedCount);
              resolve(res.deletedCount === passwordCount);
            })
            .catch((err) => {
              console.log("PasswordService - delete all passwords error:", err);
              reject(err);
            });
        })
        .catch((err) => {
          console.error("PasswordService count error:", err);
          reject(err);
        });
    });
  }

  static count(userId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      Password.count()
        .where("owner_id")
        .equals(userId)
        .then((count) => {
          console.log("PasswordService - count success");
          resolve(count);
        })
        .catch((err) => {
          console.log("PasswordService - count error:", err);
          reject(err);
        });
    });
  }
}
