import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // General email (for registration and general login)
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // University email (for college drives - @mail.ljku.edu.in)
  universityEmail: {
    type: String,
    sparse: true, // Allows null but must be unique if present
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._-]+@mail\.ljku\.edu\.in$/, 'Must be a valid LJ University email']
  },
  universityPassword: {
    type: String,
    select: false
  },
  isUniversityEmailVerified: {
    type: Boolean,
    default: false
  },
  
  role: {
    type: String,
    enum: ['student', 'admin', 'recruiter'],
    default: 'student'
  },
  profile: {
    name: {
      type: String,
      required: [true, 'Name is required']
    },
    studentId: String,
    branch: String,
    year: Number,
    avatar: String,
    companyName: String,
    designation: String
  }
}, {
  timestamps: true
});

// Hash passwords before saving
userSchema.pre('save', async function(next) {
  // Hash general password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // Hash university password if modified
  if (this.isModified('universityPassword') && this.universityPassword) {
    const salt = await bcrypt.genSalt(10);
    this.universityPassword = await bcrypt.hash(this.universityPassword, salt);
  }
  
  next();
});

// Compare general password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Compare university password
userSchema.methods.compareUniversityPassword = async function(candidatePassword) {
  if (!this.universityPassword) return false;
  return await bcrypt.compare(candidatePassword, this.universityPassword);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
