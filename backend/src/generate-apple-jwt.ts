/**
 * Run this script to generate the Apple JWT secret for Supabase.
 * Usage: bun run src/generate-apple-jwt.ts
 *
 * Fill in the 3 values below from your Apple Developer account.
 */

// ---- FILL THESE IN ----
const TEAM_ID = '757BNZYM7Q';
const KEY_ID = 'UXM9Q732X3';
const CLIENT_ID = 'com.vibecode.glossyQ';

const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgF+uAsXXa2jsd/HV2
1WGn3v4InLCwZium+sgwQrCr0o2gCgYIKoZIzj0DAQehRANCAARDllBNAmae5zZL
TSHx44gXpr8d2HAJnvClhJCMUV/1nyzyr9B+IxjKhvAFvg39BKFDe3oCXuLqIKtD
Q/U4UTRL
-----END PRIVATE KEY-----`;
// ---- END FILL IN ----

import { SignJWT, importPKCS8 } from 'jose';

async function generateAppleJWT() {
  if (PRIVATE_KEY.includes('PASTE_YOUR')) {
    console.error('❌ Please fill in PRIVATE_KEY in this file first.');
    process.exit(1);
  }

  try {
    const privateKey = await importPKCS8(PRIVATE_KEY, 'ES256');

    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: KEY_ID })
      .setIssuer(TEAM_ID)
      .setIssuedAt()
      .setAudience('https://appleid.apple.com')
      .setSubject(CLIENT_ID)
      .setExpirationTime('180d') // Apple allows max 6 months
      .sign(privateKey);

    console.log('\n✅ Your Apple JWT secret for Supabase:\n');
    console.log(jwt);
    console.log('\nPaste this into Supabase > Authentication > Providers > Apple > Secret Key\n');
  } catch (err) {
    console.error('❌ Error generating JWT:', err);
  }
}

generateAppleJWT();
