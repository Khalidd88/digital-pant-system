export type UserRole = 'WARGA' | 'WARUNG';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  qrId: string;
  balance: number;
  createdAt: string;
}

// Disamakan dengan controller backend: PLASTIC_PET
export type BottleMaterial = 'PLASTIC_PET' | 'ALUMINUM_CAN' | 'GLASS_BOTTLE';

export interface ScanVerificationPayload {
  qrId: string;
  material: BottleMaterial;
  depositValue?: number;
}

// Disamakan dengan output riil controller scan backend
export interface ScanVerificationResponse {
  success: boolean;
  message: string;
  data: {
    scanId: string;
    user: {
      name: string;
      qrId: string;
      previousBalance: number;
      newBalance: number;
      addedBalance: number;
    };
    material: string;
    timestamp: string;
  };
}

export interface ImpactAnalytics {
  totalBottles: number;
  totalDisbursed: number;
  activePartners: number;
}