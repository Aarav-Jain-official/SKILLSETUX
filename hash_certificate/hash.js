import fs from "fs";
import crypto from "crypto";

function hashCertificate(filePath) {
  const fileBuffer = fs.readFileSync(filePath);

  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  return hash;
}

const hash = hashCertificate("hash_certificate/sample_certificate.pdf");
console.log(`\nCertificate hash: ${hash}\n`);
