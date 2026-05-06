import axiosInstance from '@/lib/api/axiosInstance';
import {
  JobPosting, JobPostingRequest,
  Candidate, CandidateRequest, CandidateStageUpdateRequest, CandidateStatusUpdateRequest,
  Interview, InterviewRequest, InterviewResultRequest,
  PipelineSummary
} from '../types/recruitment.types';

const API_PRE = '/recruitment';

export const recruitmentApi = {
  // Jobs
  getJobs: () => axiosInstance.get<JobPosting[]>(`${API_PRE}/jobs`).then(res => res.data),
  getJobById: (id: string) => axiosInstance.get<JobPosting>(`${API_PRE}/jobs/${id}`).then(res => res.data),
  createJob: (data: JobPostingRequest) => axiosInstance.post<JobPosting>(`${API_PRE}/jobs`, data).then(res => res.data),
  updateJob: (id: string, data: JobPostingRequest) => axiosInstance.put<JobPosting>(`${API_PRE}/jobs/${id}`, data).then(res => res.data),
  deleteJob: (id: string) => axiosInstance.delete<void>(`${API_PRE}/jobs/${id}`).then(res => res.data),
  toggleJobStatus: (id: string) => axiosInstance.patch<void>(`${API_PRE}/jobs/${id}/toggle`).then(res => res.data),

  // Candidates
  getCandidates: () => axiosInstance.get<Candidate[]>(`${API_PRE}/candidates`).then(res => res.data),
  getCandidateById: (id: string) => axiosInstance.get<Candidate>(`${API_PRE}/candidates/${id}`).then(res => res.data),
  getCandidatesByJob: (jobId: string) => axiosInstance.get<Candidate[]>(`${API_PRE}/candidates/job/${jobId}`).then(res => res.data),
  createCandidate: (data: CandidateRequest) => axiosInstance.post<Candidate>(`${API_PRE}/candidates`, data).then(res => res.data),
  updateCandidate: (id: string, data: CandidateRequest) => axiosInstance.put<Candidate>(`${API_PRE}/candidates/${id}`, data).then(res => res.data),
  updateCandidateStage: (id: string, data: CandidateStageUpdateRequest) => axiosInstance.patch<Candidate>(`${API_PRE}/candidates/${id}/stage`, data).then(res => res.data),
  updateCandidateStatus: (id: string, data: CandidateStatusUpdateRequest) => axiosInstance.patch<Candidate>(`${API_PRE}/candidates/${id}/status`, data).then(res => res.data),
  deleteCandidate: (id: string) => axiosInstance.delete<void>(`${API_PRE}/candidates/${id}`).then(res => res.data),

  // Interviews
  getInterviews: () => axiosInstance.get<Interview[]>(`${API_PRE}/interviews`).then(res => res.data),
  getInterviewsByCandidate: (candidateId: string) => axiosInstance.get<Interview[]>(`${API_PRE}/interviews/candidate/${candidateId}`).then(res => res.data),
  scheduleInterview: (data: InterviewRequest) => axiosInstance.post<Interview>(`${API_PRE}/interviews`, data).then(res => res.data),
  updateInterviewResultPatch: (id: string, data: InterviewResultRequest) => axiosInstance.patch<Interview>(`${API_PRE}/interviews/${id}/result`, data).then(res => res.data),
  deleteInterview: (id: string) => axiosInstance.delete<void>(`${API_PRE}/interviews/${id}`).then(res => res.data),

  // Pipeline
  getPipelineSummary: (jobId: string) => axiosInstance.get<PipelineSummary>(`${API_PRE}/pipeline/${jobId}`).then(res => res.data),

  // Exports
  exportPipelineReport: async (jobId: string): Promise<ArrayBuffer> => {
    const res = await axiosInstance.get(`${API_PRE}/pipeline/${jobId}/export`, { responseType: 'arraybuffer' });
    return res.data;
  },
  exportCandidateReport: async (candidateId: string): Promise<ArrayBuffer> => {
    const res = await axiosInstance.get(`${API_PRE}/candidates/${candidateId}/report`, { responseType: 'arraybuffer' });
    return res.data;
  },
  exportInterviewReport: async (candidateId: string): Promise<ArrayBuffer> => {
    const res = await axiosInstance.get(`${API_PRE}/candidates/${candidateId}/interviews/export`, { responseType: 'arraybuffer' });
    return res.data;
  },
  generateOfferLetter: async (candidateId: string): Promise<ArrayBuffer> => {
    const res = await axiosInstance.get(`${API_PRE}/candidates/${candidateId}/offer-letter`, { responseType: 'arraybuffer' });
    return res.data;
  }
};
