import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 3,
      max: 50,
    },
    lastName: {
      type: String,
      required: true,
      min: 3,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    picturePath: {
      type: String,
      default: '',
    },
    friends: {
      type: Array,
      default: [],
    },
    friendsRequest:{
      type: Array,
      default: []
    },
    location: {
      type: String,
      default: '',
    },
    occupation: {
      type: String,
      default: '',
    },
    viewedProfile: Number,
    impressions: Number,
    lastLoginDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

UserSchema.methods.hashPassword = async function (password) {
  const user = this;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  user.password = hashedPassword;
  return true;
};

UserSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign({ id: this._id, loggedInUser: this._id }, JWT_SECRET, {
    expiresIn: '1d',
  });
};

const User = mongoose.model('User', UserSchema);

export default User;
