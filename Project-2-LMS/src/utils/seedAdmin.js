// Creates the first Admin account.
// Usage: npm run seed:admin -- <email> <password> [name]
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../model/user.model");

async function seedAdmin() {
    const [email, password, name = "Admin"] = process.argv.slice(2);

    if (!email || !password) {
        console.log('Usage: npm run seed:admin -- <email> <password> [name]');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URL);

    const normalizedEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
        console.log("Admin already exists:", normalizedEmail);
    } else {
        const hashed = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email: normalizedEmail,
            password: hashed,
            role: "Admin",
            isApproved: true,
        });
        console.log("Admin created:", normalizedEmail);
    }

    await mongoose.disconnect();
}

seedAdmin().catch((err) => {
    console.error(err);
    process.exit(1);
});
