import mongoose from 'mongoose';

const letterSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      default: 'valentine',
    },
    generatedBy: {
      type: String,
      enum: ['ai', 'fallback'],
      default: 'ai',
    },
  },
  {
    timestamps: true,
  }
);

const Letter = mongoose.model('Letter', letterSchema);

export default Letter;
