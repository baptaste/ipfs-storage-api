import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PasswordSchema = new Schema(
	{
		owner_id: { type: Schema.Types.ObjectId, ref: 'User' },
		encryption_id: {
			type: String,
			required: [true, 'Encryption ID is required.'],
		},
		ipfs: {
			cid: String,
			path: String,
			size: Number,
		},
		image_url: String,
		title: String,
		website_url: String,
		created_at: {
			type: Date,
			immutable: true,
			default: () => Date.now(),
		},
		updated_at: Date,
	},
	{
		versionKey: false,
	},
);

export default mongoose.models.Password || mongoose.model('Password', PasswordSchema);
