export type UserRole = 'WARGA' | 'WARUNG';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  qrId: string;
  balance: number;
  createdAt: string;
}

export type BottleMaterial = 'PET_PLASTIC' | 'ALUMINUM_CAN' | 'GLASS_BOTTLE';

export interface ScanVerificationPayload {
  qrId: string;
  material: BottleMaterial;
  depositValue: number;
}

export interface ScanVerificationResponse {
  success: boolean;
  message: string;
  data: {
    qrId: string;
    userName: string;
    newBalance: number;
    creditedAmount: number;
    material: string;
    scanId: string;
    timestamp: string;
  };
}

export interface ImpactAnalytics {
  totalBottles: number;
  totalDisbursed: number;
  activePartners: number;
}
