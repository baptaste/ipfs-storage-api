import { decryptData } from "../../helpers/crypto";
import { verify } from "../../helpers/hash";
import { queryProjection } from "../../helpers/query";
import User from "../../models/User";

export interface User {
  _id: string;
  email: string;
  password_key: string;
  // encryption_key: string;
  preferences: UserPreferences;
  created_at: string;
}
export interface UserPreferences {
  language: string;
}

export default class UserService {
  static create(
    email: string,
    derivedPasswordKey: string,
    preferences: UserPreferences,
  ): Promise<User | null> {
    return new Promise((resolve, reject) => {
      console.log(
        "UserService - create user with email:",
        email,
        "and master password derivedPasswordKey:",
        derivedPasswordKey,
      );
      UserService.getByField("email", email)
        .then((record) => {
          if (record) {
            console.error(`UserService - user already exists with email ${email}`);
            resolve(null);
          } else {
            User.create({
              email,
              password_key: derivedPasswordKey,
              // encryption_key: encryptionKey,
              preferences,
            })
              .then((user) => {
                console.log("UserService - create user success");
                resolve(user);
              })
              .catch((err) => {
                console.error("UserService - create user error:", err);
                reject(err);
              });
          }
        })
        .catch((err) => {
          console.error("UserService - getByField error:", err);
          reject(err);
        });
    });
  }

  static getById(userId: string, passwordKey = false, encryptionKey = false): Promise<User> {
    return new Promise((resolve, reject) => {
      User.findById(userId)
        .select(
          queryProjection([
            { field: "password_key", include: passwordKey },
            // { field: 'encryption_key', include: encryptionKey },
          ]),
        )
        .then((user) => {
          resolve(user);
        })
        .catch((err) => {
          console.error("UserService - getUser error:", err);
          reject(err);
        });
    });
  }

  static getByField(field: string, value: string, passwordKey = false): Promise<User> {
    return new Promise((resolve, reject) => {
      User.findOne()
        .where(field)
        .equals(value)
        .select(
          queryProjection([
            // { field: 'encryption_key', include: false },
            { field: "password_key", include: passwordKey },
          ]),
        )
        .then((user) => {
          console.log("UserService - getByField, user:", user);

          resolve(user);
        })
        .catch((err) => {
          console.error("UserService - getByField error:", err);
          reject(err);
        });
    });
  }

  static getAll(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      User.find()
        .then((users) => {
          console.log("UserService - get all users success");
          resolve(users);
        })
        .catch((err) => {
          console.error("UserService - get all users error:", err);
          reject(err);
        });
    });
  }

  static verifyMasterPassword(hash: string, plaintext: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      console.log("UserService - verify master password with plaintext:", plaintext);
      verify(hash, plaintext)
        .then((match: boolean) => {
          console.log("UserService - verify master password, match:", match);
          if (match) {
            console.log("UserService - verify master password success:", match);
            resolve(true);
          } else {
            console.log("UserService - verify master password failed");
            resolve(false);
          }
        })
        .catch((err) => {
          console.error("UserService - verify master password error:", err);
          reject(err);
        });
    });
  }

  // static getEncryptionKey(userId: string): Promise<string | null> {
  // 	return new Promise((resolve, reject) => {
  // 		console.log('UserService - getEncryptionKey with user id:', userId);
  // 		UserService.getById(userId, true, true)
  // 			.then((user) => {
  // 				if (user) {
  // 					const decryptedKey = decryptData(user.encryption_key, user.password_key);
  // 					resolve(decryptedKey);
  // 				} else {
  // 					console.log(
  // 						'UserService - getEncryptionKey failed. No user found with id ' +
  // 							userId,
  // 					);
  // 					resolve(null);
  // 				}
  // 			})
  // 			.catch((err) => {
  // 				console.error('UserService - getEncryptionKey error:', err);
  // 				reject(err);
  // 			});
  // 	});
  // }

  static update(userId: string, data: User): Promise<User> {
    return new Promise((resolve, reject) => {
      User.findOneAndUpdate({ _id: userId }, data, { new: true })
        .then((user) => {
          console.log("UserService - update success");
          resolve(user);
        })
        .catch((err) => {
          console.error("UserService - update error:", err);
          reject(err);
        });
    });
  }

  static delete(userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      User.deleteOne()
        .where("_id")
        .equals(userId)
        .then((res) => {
          resolve(res.deletedCount === 1);
        })
        .catch((err) => {
          console.log("UserService - delete password error:", err);
          reject(err);
        });
    });
  }
}
