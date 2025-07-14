class EncryptionManager {
  readonly encoder: TextEncoder;
  readonly decoder: TextDecoder;

  constructor() {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
  }

  // Base64 helpers (LocalStorage-safe)
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  private async deriveKeyFromPassword(
    password: string,
    salt: Uint8Array,
  ): Promise<CryptoKey> {
    const baseKey = await crypto.subtle.importKey(
      "raw",
      this.encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"],
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100_000,
        hash: "SHA-256",
      },
      baseKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["encrypt", "decrypt"],
    );
  }

  public async encryptDataToStorage(
    plaintext: string,
    password: string,
  ): Promise<{
    ciphertext: string;
    salt: string;
    iv: string;
  }> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKeyFromPassword(password, salt);

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      this.encoder.encode(plaintext),
    );

    return {
      ciphertext: this.arrayBufferToBase64(encrypted),
      salt: this.arrayBufferToBase64(salt),
      iv: this.arrayBufferToBase64(iv),
    };
  }

  public async decryptDataFromStorage(
    base64Ciphertext: string,
    password: string,
    base64Salt: string,
    base64Iv: string,
  ): Promise<string> {
    const salt = this.base64ToArrayBuffer(base64Salt);
    const iv = this.base64ToArrayBuffer(base64Iv);
    const ciphertext = this.base64ToArrayBuffer(base64Ciphertext);

    const key = await this.deriveKeyFromPassword(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );

    return this.decoder.decode(decrypted);
  }
}

export const encryptionManager = new EncryptionManager();
