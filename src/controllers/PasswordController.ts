import { AppController } from "./AppController";
import { Request, Response } from "express";
import PasswordService, {
  ClientPasswordPayload,
  Password,
} from "../services/database/PasswordService";
import { v4 as uuid } from "uuid";
import { ipfsDelete, ipfsRetrieve, ipfsStore } from "../services/ipfs/service";
import { formatIpfsObject } from "../helpers/formatters/ipfs";
import { getFaviconURL } from "../helpers/favicons";
import { extractDomainFromURL } from "../helpers/url";
import { IEncryptedData } from "../services/ipfs/types";

export class PasswordController extends AppController {
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
      console.error("PasswordController - handler err:", err);
      return this.serverError(res, err.toString());
    }
  }

  private checkOwner(res: Response, passwordRecord: any) {
    if (!this.userId) return;
    if (passwordRecord.owner_id.toString() !== this.userId) {
      return this.unauthorized(res, `User with id ${this.userId} is not the owner`);
    }
  }

  public async getAll(_: any, res: Response) {
    if (!this.userId) return;
    const passwords = await PasswordService.getAll(this.userId);
    if (passwords) {
      this.ok(res, { success: true, passwords });
    }
  }

  public async createPassword(req: Request, res: Response) {
    if (!this.userId) return;
    const { description, email, password, title, websiteUrl } = req.body;
    let displayedName: string | undefined = title;
    let imageUrl = undefined;
    if (!password) return this.clientError(res, "Password is required.");
    if (!title && !websiteUrl && !email) {
      return this.clientError(
        res,
        "Either a title, or associated email or website url is required.",
      );
    }
    if (websiteUrl) {
      imageUrl = await getFaviconURL(websiteUrl);
      if (!title && !displayedName) {
        displayedName = extractDomainFromURL(websiteUrl);
        if (displayedName) {
          displayedName = displayedName.charAt(0).toUpperCase() + displayedName.slice(1);
        }
      }
    }
    // all data obj goes to ipfs, never stored into db
    const ipfsData: IEncryptedData = {
      encrypted: password.encrypted as Uint8Array,
      vector: password.vector as Uint8Array,
    };
    const ipfsResult = await ipfsStore(ipfsData);
    if (ipfsResult.cid) {
      console.log("createPassword - ipfsResult:", ipfsResult);
      const ipfsData = formatIpfsObject(ipfsResult);
      // Create random uuid for the new password
      const encryptionId = uuid();

      const passwordData: ClientPasswordPayload = {
        encryptionId,
        email,
        description,
        displayedName,
        imageUrl,
        ipfsData,
        title,
        websiteUrl,
      };
      // Create password in db
      const newPassword = await PasswordService.create(this.userId, passwordData);
      if (!newPassword) {
        // DB Error
        return this.ok(res, {
          success: false,
          password: null,
          message: "An error occurred while creating password",
        });
      }
      this.ok(res, { success: true, password: newPassword });
    }
  }

  public async retrievePassword(req: Request, res: Response) {
    if (!this.userId) return;
    const { encryptionId } = req.body;
    if (!encryptionId) {
      return this.unauthorized(res, "password encryption id is required");
    }
    const passwordRecord = await PasswordService.getByEncryptionId(
      encryptionId,
      true, // access ipfs obj key
    );
    if (passwordRecord && passwordRecord.ipfs) {
      this.checkOwner(res, passwordRecord);
      const ipfsResult = await ipfsRetrieve(passwordRecord.ipfs.cid);
      console.log("retrievePassword - ipfsResult", ipfsResult);
      if (ipfsResult) {
        this.ok(res, { success: true, data: ipfsResult });
      }
    }
  }

  public async deletePassword(req: Request, res: Response) {
    if (!this.userId) return;
    const { encryptionId } = req.body;
    if (!encryptionId) {
      return this.unauthorized(res, "password encryption id is required");
    }
    const passwordRecord = await PasswordService.getByEncryptionId(
      encryptionId,
      true, // access ipfs obj key
    );
    console.log("CONTROLLER - passwordRecord", passwordRecord);
    if (passwordRecord && passwordRecord.ipfs) {
      this.checkOwner(res, passwordRecord);
      const ipfsResult = await ipfsDelete(passwordRecord.ipfs.cid);
      if (!ipfsResult) {
        return this.ok(res, { success: false, deleted: false });
      }
      const dbSuccess = await PasswordService.delete(passwordRecord.encryption_id);
      if (dbSuccess) {
        this.ok(res, { success: true, deleted: true });
      }
    }
  }

  public async updatePassword(req: Request, res: Response) {
    if (!this.userId) return;
    const { encryptionId, email, description, password, title, websiteUrl } = req.body;
    console.log("updatePassword - req.body", req.body);
    if (!encryptionId) {
      return this.unauthorized(res, "password encryption id is required");
    }
    if (!password && !title && !websiteUrl && !email && !description) {
      return this.clientError(
        res,
        "Either a title, website url, email, description or password is required.",
      );
    }
    const passwordRecord = await PasswordService.getByEncryptionId(encryptionId);
    if (passwordRecord) {
      this.checkOwner(res, passwordRecord);
      //   let updatedPassword: Password | undefined = undefined;
      let updateType = "all";
      if (!password && !websiteUrl && title) {
        console.log("updatePassword - TITLE UPDATE", title);
        updateType = "title";
        // updatedPassword = await this.titleUpdate(encryptionId, title);
      } else if (!password && !title && websiteUrl) {
        console.log("updatePassword - WEBSITE URL UPDATE", websiteUrl);
        updateType = "websiteUrl";
        // updatedPassword = await this.websiteUrlUpdate(encryptionId, passwordRecord, websiteUrl);
      } else if (!title && !websiteUrl && password) {
        // ipfs update
        console.log("updatePassword - PASSWORD UPDATE", password);
        updateType = "password";
        // updatedPassword = await this.passwordUpdate(encryptionId, password);
      }
      //   else if (password && title && websiteUrl) {
      //     console.log("updatePassword - COMPLETE UPDATE", password, title, websiteUrl);
      //     // updatedPassword = await this.completeUpdate(encryptionId, password, title, websiteUrl);
      //   }
      const data: ClientPasswordPayload = {
        encryptionId,
        email,
        description,
        encryptedPassword: password,
        title,
        websiteUrl,
      };
      // updatedPassword = await this.update(encryptionId, passwordRecord, passwordData);
      let payload: ClientPasswordPayload = { ...data };
      // encryption password update
      if (data.encryptedPassword) {
        const ipfsPayload: IEncryptedData = {
          encrypted: data.encryptedPassword.encrypted as Uint8Array,
          vector: data.encryptedPassword.vector as Uint8Array,
        };
        const ipfsResult = await ipfsStore(ipfsPayload);
        if (ipfsResult.cid) {
          const ipfsData = formatIpfsObject(ipfsResult);
          // add new ipfs data to payload
          payload = { ...payload, ipfsData };
        }
      }
      // website update
      if (data.websiteUrl) {
        const imageUrl = await getFaviconURL(data.websiteUrl);
        // no title in payload
        if (!data.title && !passwordRecord.title) {
          let displayedName = extractDomainFromURL(data.websiteUrl);
          if (displayedName) {
            displayedName = displayedName.charAt(0).toUpperCase() + displayedName.slice(1);
            // add displayed name to update payload based on website url
            payload = { ...payload, displayedName };
          }
        }
        // add website url and image url to update payload
        payload = { ...payload, websiteUrl: data.websiteUrl, imageUrl };
      }

      const updatedPassword = await PasswordService.update(this.userId, payload);

      this.ok(res, {
        success: updatedPassword != undefined,
        password: updatedPassword,
        updateType,
      });
    }
  }

  //   private async update(
  //     encryptionId: string,
  //     passwordRecord: Password,
  //     data: ClientPasswordPayload,
  //   ) {
  //     if (!this.userId) return;
  //     let payload: ClientPasswordPayload = { ...data };
  //     // encryption password update
  //     if (data.encryptedPassword) {
  //       const ipfsPayload: IEncryptedData = {
  //         encrypted: data.encryptedPassword.encrypted as Uint8Array,
  //         vector: data.encryptedPassword.vector as Uint8Array,
  //       };
  //       const ipfsResult = await ipfsStore(ipfsPayload);
  //       if (ipfsResult.cid) {
  //         const ipfsData = formatIpfsObject(ipfsResult);
  //         // add new ipfs data to payload
  //         payload = { ...payload, ipfsData };
  //       }
  //     }
  //     // website update
  //     if (data.websiteUrl) {
  //       const imageUrl = await getFaviconURL(data.websiteUrl);
  //       // no title in payload
  //       if (!data.title) {
  //         let displayedName = extractDomainFromURL(data.websiteUrl);
  //         if (displayedName) {
  //           displayedName = displayedName.charAt(0).toUpperCase() + displayedName.slice(1);
  //           // add displayed name to update payload based on website url
  //           payload = { ...payload, displayedName };
  //         }
  //       }
  //       // add website url and image url to update payload
  //       payload = { ...payload, websiteUrl: data.websiteUrl, imageUrl };
  //     }
  //     const updatedPassword = await PasswordService.update(this.userId, encryptionId, payload);
  //     return updatedPassword;
  //   }

  //   private async titleUpdate(encryptionId: string, title: string) {
  //     if (!this.userId) return;
  //     const updatedPassword = await PasswordService.update(this.userId, encryptionId, {
  //       displayed_name: title,
  //       title,
  //     });
  //     return updatedPassword;
  //   }

  //   private async websiteUrlUpdate(
  //     encryptionId: string,
  //     passwordRecord: Password,
  //     websiteUrl: string,
  //   ) {
  //     if (!this.userId) return;
  //     const { displayed_name, title } = passwordRecord;
  //     let displayedName: string | undefined = displayed_name;
  //     const imageUrl = await getFaviconURL(websiteUrl);
  //     if (!title) {
  //       displayedName = extractDomainFromURL(websiteUrl);
  //       if (displayedName) {
  //         displayedName = displayedName.charAt(0).toUpperCase() + displayedName.slice(1);
  //       }
  //     }
  //     const data = {
  //       displayed_name: displayedName,
  //       image_url: imageUrl,
  //       website_url: websiteUrl,
  //     };
  //     const updatedPassword = await PasswordService.update(this.userId, encryptionId, data);
  //     return updatedPassword;
  //   }

  //   private async passwordUpdate(encryptionId: string, encryptedPassword: IEncryptedData) {
  //     if (!this.userId) return;
  //     const ipfsData: IEncryptedData = {
  //       encrypted: encryptedPassword.encrypted as Uint8Array,
  //       vector: encryptedPassword.vector as Uint8Array,
  //     };
  //     const ipfsResult = await ipfsStore(ipfsData);
  //     if (ipfsResult.cid) {
  //       const ipfsData = formatIpfsObject(ipfsResult);
  //       const updatedPassword = await PasswordService.update(this.userId, encryptionId, {
  //         ipfs: ipfsData,
  //       });
  //       return updatedPassword;
  //     }
  //   }

  //   private async completeUpdate(
  //     encryptionId: string,
  //     encryptedPassword: IEncryptedData,
  //     title: string,
  //     websiteUrl: string,
  //   ) {
  //     if (!this.userId) return;
  //     let updatedPassword = await this.passwordUpdate(encryptionId, encryptedPassword);
  //     if (updatedPassword) {
  //       const imageUrl = await getFaviconURL(websiteUrl);
  //       const data = {
  //         displayed_name: title,
  //         image_url: imageUrl,
  //         title,
  //         website_url: websiteUrl,
  //       };
  //       updatedPassword = await PasswordService.update(this.userId, encryptionId, data);
  //       return updatedPassword;
  //     }
  //   }

  //TODO

  // public async deleteAll(_: any, res: Response) {
  // 	if (!this.userId) return

  // 	const contractSuccess = await ContractService.deleteAll()

  // 	if (contractSuccess) {
  // 		const dbSuccess = await PasswordService.deleteAll(this.userId)

  // 		if (dbSuccess) {
  // 			this.ok(res, { success: true, allDeleted: true })
  // 		}
  // 	}
  // }
}
