export type AuditAction =
  | 'VAULT_LOCK'
  | 'VAULT_UNLOCK'
  | 'VAULT_PIN_SETUP'
  | 'VAULT_PIN_REMOVED'
  | 'RECORD_CREATE'
  | 'RECORD_UPDATE'
  | 'RECORD_DELETE'
  | 'BACKUP_EXPORT_ENCRYPTED'
  | 'BACKUP_EXPORT_PLAIN'
  | 'BACKUP_RESTORE'
  | 'SHARE_LINK_CREATED'
  | 'SHARE_LINK_REVOKED'
  | 'SOS_ACCESSED'
  | 'SOS_BREAK_GLASS'
  | 'PRIVACY_MODE_TOGGLED'
  | 'INTEGRITY_VERIFIED'
  | 'SECURE_WIPE'
  | 'SECURITY_CONFIG_CHANGED'
  | 'NOTIFICATION_DISPATCHED';

export type SecurityCategory =
  | 'Control de Acceso (A.5.15 / CC6.1)'
  | 'Criptografía & Cifrado (A.8.24 / CC6.6)'
  | 'Registro de Auditoría (A.8.15 / CC7.2)'
  | 'Privacidad & Confidencialidad (A.5.34 / CC6.3)'
  | 'Gestión de Incidentes (A.8.18 / CC7.3)'
  | 'Copias de Seguridad (A.8.14 / CC6.8)';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO-8601
  action: AuditAction;
  category: SecurityCategory;
  description: string;
  actor: string; // 'Usuario Propietario', 'Cuidador Autorizado', 'Personal de Emergencia'
  severity: 'info' | 'warning' | 'critical';
  details?: Record<string, any>;
  prevHash: string;
  hash: string; // SHA-256(id + timestamp + action + description + prevHash)
}

export interface SecurityConfig {
  isPinEnabled: boolean;
  pinHash?: string; // SHA-256 of salt + pin
  pinSalt?: string;
  autoLockMinutes: number; // 0 = disabled, 1, 3, 5, 15
  lockOnBlur: boolean;
  maskSensitiveData: boolean; // Hide DNI, chip, affiliate on screen
  isDataEncryptedAtRest: boolean;
  lastIntegrityCheck?: string;
}

export interface ComplianceControl {
  id: string;
  framework: 'ISO/IEC 27001:2022' | 'SOC 2 Type II';
  clause: string;
  name: string;
  description: string;
  status: 'compliant' | 'active' | 'enforced';
  evidence: string;
}
