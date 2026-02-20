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
    category: {
      type: String,
      enum: ['valentine', 'birthday', 'anniversary','flirty','sorry', 'longdistance','daily','healing'],
      default: 'valentine',
    },
    language: {
      type: String,
      default: "English"
    }
  },
  {
    timestamps: true,
  }
);

const Letter = mongoose.model('Letter', letterSchema);

export default Letter;
