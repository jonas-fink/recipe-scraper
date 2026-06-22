import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'user' | 'admin';
export interface IUser extends Document {
    name?: string;
    email: string;
    password: string;
    role: UserRole;
    comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
            index: true,
        },
    },
    { timestamps: true },
);

UserSchema.pre<IUser>('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = function (candidate: string) {
    return bcrypt.compare(candidate, this.password);
};

UserSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        const { password, ...rest } = ret as IUser & { password?: string };
        return rest;
    },
});

UserSchema.set('toObject', { virtuals: true });

export default mongoose.model<IUser>('User', UserSchema);
