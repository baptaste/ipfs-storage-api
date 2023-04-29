import mongoose from 'mongoose'

const Schema = mongoose.Schema

const TokenSchema = new Schema(
	{
		user_id: { type: Schema.Types.ObjectId, ref: 'User' },
		value: {
			type: String,
			required: [true, 'Value is required.']
		},
		created_at: {
			type: Date,
			immutable: true,
			default: () => Date.now()
		}
	},
	{
		versionKey: false
	}
)

export default mongoose.models.Token || mongoose.model('Token', TokenSchema)