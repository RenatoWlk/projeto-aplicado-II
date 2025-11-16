export enum DonationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-'
}

export interface CreateDonationRequest {
  userId: string;
  bloodBankId: string;
  date: string;
  hour: string;
  slot: number;
}

export interface DonationResponse {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  bloodBankId: string;
  bloodBankName?: string;
  bloodBankAddress?: string;
  date: string;
  hour: string;
  slot: number;
  bloodType: BloodType;
  status: DonationStatus;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlotAvailability {
  available: boolean;
  slotsUsed: number;
  slotsRemaining: number;
}

export interface CancelDonationRequest {
  reason?: string;
}

export interface DonationStats {
  byStatus: { [key: string]: number };
  byBloodType: { [key: string]: number };
  totalDonations: number;
  completedDonations: number;
  pendingDonations: number;
  cancelledDonations: number;
}

export interface DonationSlots {
  id: string;
  availabilitySlots: {
    date: string;
    slots: {
      time: string;
      availableSpots: number;
    }[];
  }[];
}
