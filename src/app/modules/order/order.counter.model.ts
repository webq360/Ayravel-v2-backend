import { Schema, model } from "mongoose";

interface TOrderCounter {
  date: string; // Format: YYYYMMDD
  count: number;
}

const orderCounterSchema = new Schema<TOrderCounter>({
  date: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    required: true,
    default: 0,
  },
});

export const OrderCounterModel = model<TOrderCounter>("OrderCounter", orderCounterSchema);
