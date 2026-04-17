import { Estimate, JobListing } from '../types/glossy';

export type RootStackParamList = {
  Welcome: undefined;
  CustomerEstimate: undefined;
  CustomerRoomInput: undefined;
  CustomerExtras: undefined;
  PaymentSelection: { estimate: Estimate };
  EstimateResult: { estimate: Estimate };
  JobPosting: { estimate?: Estimate }; // Made optional for multi-trade support
  CustomerProfile: undefined;
  ProfessionalAuth: undefined;
  ProfessionalDashboard: undefined;
  ProfessionalJobBoard: undefined;
  MyLeads: undefined;
  ProfessionalProfile: undefined;
  ProfessionalCredits: undefined;
  PremiumPaywall: undefined;
  JobDetails: { job: JobListing };
  CostTracking: undefined;
  FunctionLogs: undefined;
  Referral: undefined;
  Contact: undefined;
  Legal: undefined;
  LeadSettings: undefined;
  LeadMap: undefined;
  PerformanceDashboard: undefined;
  MessageTemplates: undefined;
  ResetPassword: undefined;
  AdminDashboard: undefined;
  PublicProfessionalProfile: { professionalId: string };
};
