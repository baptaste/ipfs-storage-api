import { Password } from "../../services/database/PasswordService";

export function formatPassword(password: Password, returnIpfs?: boolean) {
	let result: Password = {
		_id: password._id,
		encryption_id: password.encryption_id,
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
