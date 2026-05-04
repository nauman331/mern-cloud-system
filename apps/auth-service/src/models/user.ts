import mongoose from 'mongoose';

interface UserAttrs {
    username: string;
    email: string;
    password?: string;
    googleId?: string;
    role?: 'user' | 'admin';
}

interface UserDoc extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    password?: string;
    googleId?: string;
    role: 'user' | 'admin';
}

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    password: { type: String },
    googleId: { type: String },
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };