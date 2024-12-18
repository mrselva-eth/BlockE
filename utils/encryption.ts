export function encryptMessage(message: string, recipientPublicKey: string): Promise<string> {
  console.log("Encrypting message:", message);
  console.log("Recipient public key:", recipientPublicKey);

  return new Promise((resolve) => {
    // For now, let's use a simple UTF-8 encoding as a placeholder
    // In a real-world scenario, you'd use proper encryption here
    const encoded = Buffer.from(message).toString('base64');

    console.log("Encrypted message:", encoded);
    resolve(encoded);
  });
}

export function decryptMessage(encryptedMessage: string, privateKey: string): Promise<string> {
  console.log("Decrypting message:", encryptedMessage);
  console.log("Private key:", privateKey);

  return new Promise((resolve) => {
    // Decode the Base64 encoded message
    const decoded = Buffer.from(encryptedMessage, 'base64').toString('utf-8');

    console.log("Decrypted message:", decoded);
    resolve(decoded);
  });
}

