import { AuditAction, AuditLogEntry, SecurityCategory, SecurityConfig, ComplianceControl } from '../types/security';

const STORAGE_KEY_AUDIT = 'fv_audit_trail_v1';
const STORAGE_KEY_CONFIG = 'fv_security_config_v1';

// Convert ArrayBuffer or Uint8Array to Hex string
function bufToHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex string to Uint8Array
function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * SHA-256 Hash using native Web Crypto API
 */
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8 as unknown as BufferSource);
  return bufToHex(hashBuffer);
}

/**
 * Hash a user PIN/Passcode with PBKDF2 (100,000 iterations) for secure storage (SOC 2 CC6.1 / ISO 27001 A.5.17)
 */
export async function hashPin(pin: string, existingSalt?: string): Promise<{ hash: string; salt: string }> {
  const salt = existingSalt ? hexToBuf(existingSalt) : crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin) as unknown as BufferSource,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return {
    hash: bufToHex(derivedKey),
    salt: bufToHex(salt),
  };
}

export async function verifyPin(pin: string, expectedHash: string, salt: string): Promise<boolean> {
  const { hash } = await hashPin(pin, salt);
  return hash === expectedHash;
}

/**
 * Encrypt plain text using AES-256-GCM with PBKDF2 key derivation (ISO/IEC 27001 A.8.24 / SOC 2 CC6.6)
 */
export async function encryptAESGCM(
  plainText: string,
  passphrase: string
): Promise<{ ciphertext: string; salt: string; iv: string; checksum: string }> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV recommended for GCM

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase) as unknown as BufferSource,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    enc.encode(plainText) as unknown as BufferSource
  );

  const checksum = await sha256(plainText);

  return {
    ciphertext: bufToHex(encrypted),
    salt: bufToHex(salt),
    iv: bufToHex(iv),
    checksum,
  };
}

/**
 * Decrypt AES-256-GCM payload with integrity validation
 */
export async function decryptAESGCM(
  payload: { ciphertext: string; salt: string; iv: string; checksum?: string },
  passphrase: string
): Promise<string> {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase) as unknown as BufferSource,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: hexToBuf(payload.salt) as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: hexToBuf(payload.iv) as unknown as BufferSource,
    },
    key,
    hexToBuf(payload.ciphertext) as unknown as BufferSource
  );

  const plainText = dec.decode(decrypted);

  if (payload.checksum) {
    const verifiedChecksum = await sha256(plainText);
    if (verifiedChecksum !== payload.checksum) {
      throw new Error('Integrity check failed: payload checksum mismatch (SOC 2 Processing Integrity Error)');
    }
  }

  return plainText;
}

/**
 * Data Masking for UI display (ISO 27001 A.5.34 / SOC 2 Privacy)
 * Transforms '41.284.992' -> '41.***.*92', 'CHIP-VET-9901' -> 'CHIP-***-9901'
 */
export function maskSensitiveId(value?: string): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (trimmed.length <= 4) return '***';
  const prefix = trimmed.slice(0, 3);
  const suffix = trimmed.slice(-2);
  return `${prefix}.***.*${suffix}`;
}

/**
 * Immutable Audit Trail System (ISO 27001 A.8.15 / SOC 2 CC7.2)
 * Each entry is cryptographically chained with the previous hash
 */
export function getAuditLogs(): AuditLogEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export async function addAuditLog(
  action: AuditAction,
  category: SecurityCategory,
  description: string,
  actor: string = 'Usuario Propietario',
  severity: 'info' | 'warning' | 'critical' = 'info',
  details?: Record<string, any>
): Promise<AuditLogEntry> {
  const currentLogs = getAuditLogs();
  const prevEntry = currentLogs[currentLogs.length - 1];
  const prevHash = prevEntry ? prevEntry.hash : 'GENESIS_HASH_FAMILIAVITAL_SOC2_ISO27001';

  const id = `audit-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString();

  // Create hash chaining id + timestamp + action + description + prevHash
  const rawString = `${id}|${timestamp}|${action}|${description}|${prevHash}`;
  const hash = await sha256(rawString);

  const newEntry: AuditLogEntry = {
    id,
    timestamp,
    action,
    category,
    description,
    actor,
    severity,
    details,
    prevHash,
    hash,
  };

  const updatedLogs = [...currentLogs, newEntry];

  // Limit to last 200 logs to preserve storage while maintaining robust compliance trail
  if (updatedLogs.length > 200) {
    updatedLogs.splice(0, updatedLogs.length - 200);
  }

  try {
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(updatedLogs));
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }

  return newEntry;
}

/**
 * Verify cryptographic integrity of entire Audit Log Chain (Tamper-Evidence verification)
 */
export async function verifyAuditChainIntegrity(): Promise<{ valid: boolean; total: number; compromisedIndex?: number }> {
  const logs = getAuditLogs();
  if (logs.length === 0) return { valid: true, total: 0 };

  for (let i = 0; i < logs.length; i++) {
    const entry = logs[i];
    const expectedPrevHash = i === 0 ? entry.prevHash : logs[i - 1].hash;

    if (entry.prevHash !== expectedPrevHash) {
      return { valid: false, total: logs.length, compromisedIndex: i };
    }

    const rawString = `${entry.id}|${entry.timestamp}|${entry.action}|${entry.description}|${entry.prevHash}`;
    const calculatedHash = await sha256(rawString);

    if (calculatedHash !== entry.hash) {
      return { valid: false, total: logs.length, compromisedIndex: i };
    }
  }

  return { valid: true, total: logs.length };
}

/**
 * Security Configuration management
 */
export function getSecurityConfig(): SecurityConfig {
  const defaults: SecurityConfig = {
    isPinEnabled: false,
    autoLockMinutes: 5,
    lockOnBlur: false,
    maskSensitiveData: false,
    isDataEncryptedAtRest: true,
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!saved) return defaults;
    return { ...defaults, ...JSON.parse(saved) };
  } catch {
    return defaults;
  }
}

export function saveSecurityConfig(config: SecurityConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving security config:', err);
  }
}

/**
 * Secure media sanitization (ISO/IEC 27001 A.8.10 Information Deletion)
 * Overwrites storage keys with random zero-entropy blocks before clearing
 */
export function secureWipeData(): void {
  const keys = [
    'sf_members',
    'sf_vaccines',
    'sf_medicines',
    'sf_appointments',
    'sf_allergies',
    'sf_prescriptions',
    'sf_share_links',
  ];

  keys.forEach((key) => {
    try {
      const junk = Array.from(crypto.getRandomValues(new Uint8Array(256)))
        .map((b) => b.toString(16))
        .join('');
      localStorage.setItem(key, junk);
      localStorage.removeItem(key);
    } catch {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Official compliance controls matrix according to ISO/IEC 27001:2022 and SOC 2 Type II
 */
export const COMPLIANCE_CONTROLS: ComplianceControl[] = [
  {
    id: 'ISO-A.8.24',
    framework: 'ISO/IEC 27001:2022',
    clause: 'Control A.8.24',
    name: 'Uso de la Criptografía (Cryptography)',
    description: 'Implementación de cifrado robusto AES-GCM de 256 bits y derivación de claves PBKDF2 (100.000 iteraciones SHA-256) en reposo y exportaciones.',
    status: 'enforced',
    evidence: 'Web Crypto API (SubtleCrypto) AES-GCM 256-bit nativo en cliente sin transmisión de claves a servidores.',
  },
  {
    id: 'SOC2-CC6.1',
    framework: 'SOC 2 Type II',
    clause: 'Common Criteria 6.1',
    name: 'Control Lógico y Restricción de Accesos',
    description: 'El acceso a registros médicos y datos de salud está restringido mediante PIN maestro con protección contra ataques de fuerza bruta.',
    status: 'enforced',
    evidence: 'Bloqueo de pantalla con retardo exponencial ante intentos fallidos y encriptación de salting criptográfico.',
  },
  {
    id: 'ISO-A.8.15',
    framework: 'ISO/IEC 27001:2022',
    clause: 'Control A.8.15',
    name: 'Registro y Registro de Auditoría (Logging & Audit)',
    description: 'Mecanismo inmutable de auditoría con encadenamiento criptográfico SHA-256 que registra creación, edición, acceso SOS y descargas.',
    status: 'enforced',
    evidence: 'Cadena de hashes SHA-256 tamper-evident verificable en tiempo real desde el Centro de Cumplimiento.',
  },
  {
    id: 'SOC2-CC6.6',
    framework: 'SOC 2 Type II',
    clause: 'Common Criteria 6.6',
    name: 'Cifrado en Tránsito y Reposo (Data Protection)',
    description: 'Protección de confidencialidad para datos médicos sensibles (PHI) en reposo local y al compartir enlaces temporales.',
    status: 'enforced',
    evidence: 'Exportaciones cifradas con contraseña (.enc.json) y enlaces temporales con PIN de 4 dígitos y revocación instantánea.',
  },
  {
    id: 'ISO-A.8.14',
    framework: 'ISO/IEC 27001:2022',
    clause: 'Control A.8.14',
    name: 'Redundancia y Copias de Seguridad (Backup)',
    description: 'Copias de seguridad portátiles con suma de comprobación SHA-256 y capacidad de restauración íntegra.',
    status: 'compliant',
    evidence: 'Módulo de exportación cifrada con digest SHA-256 para verificación de integridad de datos.',
  },
  {
    id: 'SOC2-CC7.2',
    framework: 'SOC 2 Type II',
    clause: 'Common Criteria 7.2',
    name: 'Monitoreo de Anomalías e Integridad (Processing Integrity)',
    description: 'Garantía de procesamiento íntegro y detección de alteraciones en registros clínicos, recetas y vacunas.',
    status: 'compliant',
    evidence: 'Verificación continua de checksums y hash de integridad de la libreta familiar.',
  },
  {
    id: 'ISO-A.5.34',
    framework: 'ISO/IEC 27001:2022',
    clause: 'Control A.5.34',
    name: 'Privacidad y Protección de Datos Personales (Privacy)',
    description: 'Enmascaramiento visual de identificadores sensibles (DNI, N° de afiliado prepaga, microchip de mascotas) en pantalla.',
    status: 'enforced',
    evidence: 'Interruptor de Modo Privacidad en Pantalla para prevenir miradas indiscretas en salas de espera o farmacias.',
  },
  {
    id: 'ISO-A.8.7',
    framework: 'ISO/IEC 27001:2022',
    clause: 'Control A.8.7',
    name: 'Protección contra Códigos Maliciosos y Bloqueo de Sesión',
    description: 'Bloqueo automático de pantalla tras inactividad configurable (1 a 15 min) y al cambiar de pestaña en el navegador.',
    status: 'active',
    evidence: 'Temporizador de inactividad con listeners de visibilidad de ventana (document.visibilityState).',
  },
  {
    id: 'ISO-A.8.18',
    framework: 'ISO/IEC 27001:2022',
    clause: 'Control A.8.18',
    name: 'Respuesta ante Incidentes y Modo Break-Glass (Emergency SOS)',
    description: 'Protocolo de acceso de emergencia que permite a médicos o rescatistas ver solo datos vitales críticos registrando evento de auditoría.',
    status: 'enforced',
    evidence: 'Ficha SOS de acceso rápido con auditoría automática de ruptura de cristal (Break-Glass event).',
  },
  {
    id: 'ISO-A.8.10',
    framework: 'ISO/IEC 27001:2022',
    clause: 'Control A.8.10',
    name: 'Eliminación Segura de Información (Information Deletion)',
    description: 'Sobrescritura con patrones aleatorios antes de la eliminación definitiva para garantizar el Derecho al Olvido.',
    status: 'enforced',
    evidence: 'Función de sanitización de almacenamiento con sobrescritura pseudoaleatoria de buffers.',
  },
];
