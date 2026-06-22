import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRefreshToken extends Document {
    userId: Types.ObjectId;
    tokenHash: string;
    family: string;
    expiresAt: Date;
    replacedByHash?: string;
    revokedAt?: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        tokenHash: { type: String, required: true, unique: true, index: true },
        family: { type: String, required: true, index: true },
        expiresAt: { type: Date, required: true },
        replacedByHash: { type: String },
        revokedAt: { type: Date },
    },
    { timestamps: true },
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IRefreshToken>(
    'RefreshToken',
    RefreshTokenSchema,
);
