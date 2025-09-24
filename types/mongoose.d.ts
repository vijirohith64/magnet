import type mongoose from "mongoose"

declare global {
  var globalMongoose: {
    conn: mongoose.Mongoose | null
    promise: Promise<mongoose.Mongoose> | null
  }
}
