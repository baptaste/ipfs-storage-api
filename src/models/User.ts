import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema(
	{
		email: {
			type: String,
			unique: true,
			required: [true, 'Email is required.'],
		},
		password_key: {
			type: String,
			unique: true,
			required: [true, 'Password key is required.'],
		},
		// encryption_key: {
		// 	type: String,
		// 	unique: true,
		// 	required: [true, 'Encryption key is required.']
		// },
		preferences: {
			language: {
				type: String,
				//required: [true, 'Language is required.']
			},
		},
		created_at: {
			type: Date,
			immutable: true,
			default: () => Date.now(),
		},
	},
	{
		versionKey: false,
	},
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
