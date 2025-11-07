import bcrypt from 'bcrypt';
export default async function handler(req, res) {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });

  const record = await storage.findPasswordSetupByToken(token);
  if (!record || new Date(record.expiresAt) < new Date()) {
    return res.status(400).json({ message: 'Token invalid or expired' });
  }

  const hashed = await bcrypt.hash(password, 10);
  await storage.setUserPassword(record.userId, hashed);
  await storage.clearPasswordSetupToken(record.userId);
  await storage.markEmailVerified(record.userId);

  return res.json({ success: true });
}
