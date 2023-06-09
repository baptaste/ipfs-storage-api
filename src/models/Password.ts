import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PasswordSchema = new Schema(
	{
		owner_id: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Owner ID is required."],
		},
		encryption_id: {
			type: String,
			required: [true, "Encryption ID is required."],
		},
		created_at: {
			type: Date,
			immutable: true,
			default: () => Date.now(),
		},
		displayed_name: {
			type: String,
			required: [true, "Displayed name is required."],
		},
		image_url: {
			type: String,
			default: () => null,
		},
		ipfs: {
			cid: String,
			path: String,
			size: Number,
		},
		title: {
			type: String,
			default: () => null,
		},
		updated_at: Date,
		website_url: {
			type: String,
			default: () => null,
		},
	},
	{
		versionKey: false,
	},
);

export default mongoose.models.Password || mongoose.model("Password", PasswordSchema);
