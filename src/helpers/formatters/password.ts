import { Password } from '../../services/database/PasswordService';

export function formatPassword(password: Password, returnIpfs?: boolean) {
	let result: Password = {
		_id: password._id,
		owner_id: password.owner_id,
		title: password.title,
		website_url: password.website_url,
		image_url: password.image_url,
		encryption_id: password.encryption_id,
		created_at: password.created_at,
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
