import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const ScoreSchema = new Schema({
  created_date: {
    default: Date.now,
    type: Date
  },
  name: {
    required: "Enter a name",
    type: String
  },
  score: {
    required: "Enter a name",
    type: Number
  }
});
