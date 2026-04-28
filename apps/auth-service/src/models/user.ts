import mongoose from 'mongoose';

interface UserAttrs {
    email: string;
    password?: string;
    googleId?: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends mongoose.Document {
    email: string;
    password?: string;
    googleId?: string;
}

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {
    toJSON: {
        transform(ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
        }
    }
});

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);
export { User };