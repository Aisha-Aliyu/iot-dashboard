const bcrypt = require("bcryptjs");

// The public demo account. Its password is shown on the login page on purpose.
const DEMO_EMAIL = "operator@stratum.io";
const DEMO_PASSWORD = "Stratum@Op1!";
const ADMIN_EMAIL = "admin@stratum.io";
const MIN_ADMIN_PASSWORD_LENGTH = 12;

const isDemoUser = (user) => user?.email === DEMO_EMAIL;

// Runs on every start. The demo account always signs in with the published password, and
// the admin account only works with a private password set in ADMIN_PASSWORD.
const ensureAccounts = async (prisma) => {
  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { password: demoHash, role: "OPERATOR", isActive: true },
    create: {
      email: DEMO_EMAIL,
      password: demoHash,
      displayName: "Demo Operator",
      role: "OPERATOR",
    },
  });

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword && adminPassword.length >= MIN_ADMIN_PASSWORD_LENGTH) {
    const adminHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: { password: adminHash, role: "ADMIN", isActive: true },
      create: {
        email: ADMIN_EMAIL,
        password: adminHash,
        displayName: "STRATUM Admin",
        role: "ADMIN",
      },
    });
  } else {
    // The old admin password was published, so the account stays off without a private one
    await prisma.user.updateMany({ where: { email: ADMIN_EMAIL }, data: { isActive: false } });
    console.warn(
      `ADMIN_PASSWORD is not set (${MIN_ADMIN_PASSWORD_LENGTH}+ characters), so the admin account is switched off`
    );
  }
};

// Everyone shares the demo account, so it can't change anything the next visitor would see
const blockDemo = (req, res, next) => {
  if (isDemoUser(req.user)) {
    return res.status(403).json({
      success: false,
      message: "This isn't available in the demo account",
    });
  }
  next();
};

module.exports = { DEMO_EMAIL, isDemoUser, ensureAccounts, blockDemo };
