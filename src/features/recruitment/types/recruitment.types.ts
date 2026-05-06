export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT' | 'PAUSED';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
export type CandidateStage = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';
export type CandidateStatus = 'ACTIVE' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type InterviewType = 'PHONE' | 'VIDEO' | 'IN_PERSON';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: JobType;
  status: JobStatus;
  salaryRange?: string;
  description?: string;
  requirements?: string;
  closingDate?: string;
  openingsCount: number;
  postedByName?: string;
  candidateCount: number;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  resumeUrl?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  source?: string;
  currentStage: CandidateStage;
  status: CandidateStatus;
  appliedAt: string;
  notes?: string;
  jobPostingTitle?: string;
  jobPostingId: string;
  interviewCount: number;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobPostingTitle: string;
  scheduledAt: string;
  durationMinutes: number;
  interviewType: InterviewType;
  status: InterviewStatus;
  interviewerName: string;
  feedback?: string;
  rating?: number;
}

export interface PipelineSummary {
  jobPostingId: string;
  jobTitle: string;
  totalCandidates: number;
  countPerStage: Record<CandidateStage, number>;
}

export interface JobPostingRequest {
  title: string;
  department: string;
  location: string;
  type: JobType;
  status: JobStatus;
  salaryRange?: string;
  description?: string;
  requirements?: string;
  closingDate?: string;
  openingsCount: number;
  tenantId?: string; // SUPER_ADMIN only
}

export interface CandidateRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
  resumeUrl?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  source?: string;
  notes?: string;
  jobPostingId: string;
}

export interface CandidateStageUpdateRequest {
  currentStage: CandidateStage;
}

export interface CandidateStatusUpdateRequest {
  status: CandidateStatus;
}

export interface InterviewRequest {
  candidateId: string;
  scheduledAt: string;
  durationMinutes: number;
  interviewType: InterviewType;
  interviewerId: string;
  notes?: string;
}

export interface InterviewResultRequest {
  feedback?: string;
  rating?: number;
  status: InterviewStatus;
}
