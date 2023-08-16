import mongoose from "mongoose";

const Schema = mongoose.Schema;

const NoteSchema = new Schema(
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
  },
  {
    versionKey: false,
  },
);

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
