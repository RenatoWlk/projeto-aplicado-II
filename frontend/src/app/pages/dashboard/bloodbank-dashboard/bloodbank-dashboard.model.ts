/**
 * Interface para dados brutos de doação vindos da API
 */
export interface DonationData {
  id: string;
  userId: string;
  bloodBankId: string;
  date: string;
  hour: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  slot?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface para estatísticas processadas de doações
 */
export interface ProcessedDonationStats {
  totalDonations: number;
  scheduledDonations: number;
  completedDonations: number;
  cancelledDonations: number;
  pendingDonations: number;
  confirmedDonations: number;
  donationsOverTime: Array<{
    month: string;
    year: number;
    donations: number;
  }>;
  bloodTypeDistribution: Record<string, number>;
}

/**
 * Interface para dados mensais de doações
 */
export interface MonthlyDonations {
  month: string;
  year: number;
  donations: number;
  completed?: number;
  scheduled?: number;
  cancelled?: number;
}

/**
 * Status de doação traduzidos
 */
export const DONATION_STATUS_LABELS: Record<string, string> = {
  'PENDING': 'Pendente',
  'CONFIRMED': 'Confirmado',
  'COMPLETED': 'Completado',
  'CANCELLED': 'Cancelado'
};

/**
 * Nomes dos meses
 */
export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Abreviações dos meses
 */
export const MONTH_ABBREVIATIONS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

/**
 * Cores para tipos sanguíneos
 */
export const BLOOD_TYPE_COLORS: Record<string, string> = {
  'A+': '#75ee75',   // light green
  'A-': '#1b6e1b',   // strong green
  'B+': '#5dc2e4',   // light blue
  'B-': '#1a81e9',   // strong blue
  'AB+': '#fff599',  // light yellow
  'AB-': '#ffe139',  // strong yellow
  'O+': '#ff6262',   // light red
  'O-': '#ff2929'    // strong red
};

/**
 * Todos os tipos sanguíneos possíveis
 */
export const ALL_BLOOD_TYPES: Array<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'> = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];