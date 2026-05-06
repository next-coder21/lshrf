import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { recruitmentApi } from '../api/recruitmentApi';
import {
  JobPosting, JobPostingRequest,
  Candidate, CandidateRequest, CandidateStageUpdateRequest, CandidateStatusUpdateRequest,
  Interview, InterviewRequest, InterviewResultRequest,
  PipelineSummary
} from '../types/recruitment.types';

export const fetchJobs = createAsyncThunk('recruitment/fetchJobs', async () => await recruitmentApi.getJobs());
export const createJob = createAsyncThunk('recruitment/createJob', async (data: JobPostingRequest) => await recruitmentApi.createJob(data));
export const updateJob = createAsyncThunk('recruitment/updateJob', async ({ id, data }: { id: string; data: JobPostingRequest }) => await recruitmentApi.updateJob(id, data));
export const deleteJob = createAsyncThunk('recruitment/deleteJob', async (id: string) => { await recruitmentApi.deleteJob(id); return id; });
export const toggleJobStatus = createAsyncThunk('recruitment/toggleJobStatus', async (id: string) => { await recruitmentApi.toggleJobStatus(id); return id; });

export const fetchCandidates = createAsyncThunk('recruitment/fetchCandidates', async () => await recruitmentApi.getCandidates());
export const fetchCandidatesByJob = createAsyncThunk('recruitment/fetchCandidatesByJob', async (jobId: string) => await recruitmentApi.getCandidatesByJob(jobId));
export const createCandidate = createAsyncThunk('recruitment/createCandidate', async (data: CandidateRequest) => await recruitmentApi.createCandidate(data));
export const updateCandidate = createAsyncThunk('recruitment/updateCandidate', async ({ id, data }: { id: string; data: CandidateRequest }) => await recruitmentApi.updateCandidate(id, data));
export const updateCandidateStage = createAsyncThunk('recruitment/updateCandidateStage', async ({ id, data }: { id: string; data: CandidateStageUpdateRequest }) => await recruitmentApi.updateCandidateStage(id, data));
export const updateCandidateStatus = createAsyncThunk('recruitment/updateCandidateStatus', async ({ id, data }: { id: string; data: CandidateStatusUpdateRequest }) => await recruitmentApi.updateCandidateStatus(id, data));
export const deleteCandidate = createAsyncThunk('recruitment/deleteCandidate', async (id: string) => { await recruitmentApi.deleteCandidate(id); return id; });

export const fetchInterviews = createAsyncThunk('recruitment/fetchInterviews', async () => await recruitmentApi.getInterviews());
export const fetchInterviewsByCandidate = createAsyncThunk('recruitment/fetchInterviewsByCandidate', async (candidateId: string) => await recruitmentApi.getInterviewsByCandidate(candidateId));
export const scheduleInterview = createAsyncThunk('recruitment/scheduleInterview', async (data: InterviewRequest) => await recruitmentApi.scheduleInterview(data));
export const updateInterviewResult = createAsyncThunk('recruitment/updateInterviewResult', async ({ id, data }: { id: string; data: InterviewResultRequest }) => await recruitmentApi.updateInterviewResultPatch(id, data));
export const deleteInterview = createAsyncThunk('recruitment/deleteInterview', async (id: string) => { await recruitmentApi.deleteInterview(id); return id; });

export const fetchPipelineSummary = createAsyncThunk('recruitment/fetchPipelineSummary', async (jobId: string) => await recruitmentApi.getPipelineSummary(jobId));

interface RecruitmentState {
  jobs: JobPosting[];
  candidates: Candidate[];
  interviews: Interview[];
  selectedJob: JobPosting | null;
  pipeline: PipelineSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: RecruitmentState = {
  jobs: [],
  candidates: [],
  interviews: [],
  selectedJob: null,
  pipeline: null,
  loading: false,
  error: null,
};

const recruitmentSlice = createSlice({
  name: 'recruitment',
  initialState,
  reducers: {
    setSelectedJob(state, action: PayloadAction<JobPosting | null>) {
      state.selectedJob = action.payload;
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    const setLoading = (state: RecruitmentState) => {
      state.loading = true;
      state.error = null;
    };
    const setError = (state: RecruitmentState, action: any) => {
      state.loading = false;
      state.error = action.error.message || 'An error occurred';
    };

    builder
      .addCase(fetchJobs.pending, setLoading)
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, setError)
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.push(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(j => j.id === action.payload.id);
        if (index !== -1) state.jobs[index] = action.payload;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter(j => j.id !== action.payload);
      })
      
      .addCase(fetchCandidates.pending, setLoading)
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.candidates = action.payload;
      })
      .addCase(fetchCandidates.rejected, setError)
      .addCase(fetchCandidatesByJob.pending, setLoading)
      .addCase(fetchCandidatesByJob.fulfilled, (state, action) => {
        state.loading = false;
        state.candidates = action.payload;
      })
      .addCase(fetchCandidatesByJob.rejected, setError)
      .addCase(createCandidate.fulfilled, (state, action) => {
        state.candidates.push(action.payload);
        if (state.pipeline) {
          state.pipeline.totalCandidates++;
          state.pipeline.countPerStage['APPLIED'] = (state.pipeline.countPerStage['APPLIED'] || 0) + 1;
        }
      })
      .addCase(updateCandidate.fulfilled, (state, action) => {
        const index = state.candidates.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.candidates[index] = action.payload;
      })
      .addCase(updateCandidateStage.fulfilled, (state, action) => {
        const index = state.candidates.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          const oldStage = state.candidates[index].currentStage;
          state.candidates[index] = action.payload;
          
          if (state.pipeline && state.pipeline.jobPostingId === action.payload.jobPostingId) {
             state.pipeline.countPerStage[oldStage]--;
             state.pipeline.countPerStage[action.payload.currentStage] = (state.pipeline.countPerStage[action.payload.currentStage] || 0) + 1;
          }
        }
      })
      .addCase(updateCandidateStatus.fulfilled, (state, action) => {
        const index = state.candidates.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.candidates[index] = action.payload;
      })
      .addCase(deleteCandidate.fulfilled, (state, action) => {
        state.candidates = state.candidates.filter(c => c.id !== action.payload);
      })

      .addCase(fetchInterviews.pending, setLoading)
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews = action.payload;
      })
      .addCase(fetchInterviews.rejected, setError)
      .addCase(fetchInterviewsByCandidate.pending, setLoading)
      .addCase(fetchInterviewsByCandidate.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews = action.payload;
      })
      .addCase(scheduleInterview.fulfilled, (state, action) => {
        state.interviews.push(action.payload);
      })
      .addCase(updateInterviewResult.fulfilled, (state, action) => {
        const index = state.interviews.findIndex(i => i.id === action.payload.id);
        if (index !== -1) state.interviews[index] = action.payload;
      })
      .addCase(deleteInterview.fulfilled, (state, action) => {
        state.interviews = state.interviews.filter(i => i.id !== action.payload);
      })

      .addCase(fetchPipelineSummary.fulfilled, (state, action) => {
        state.pipeline = action.payload;
      });
  }
});

export const { setSelectedJob, clearError } = recruitmentSlice.actions;
export default recruitmentSlice.reducer;
