export type ReviewStatus = 'DRAFT' | 'SUBMITTED' | 'FINALIZED' | 'ACKNOWLEDGED';

export interface PerformanceReview {
    id: string;
    employeeId: string;
    employeeName: string;
    reviewerId?: string;
    reviewerName?: string;
    reviewDate: string;
    rating: number;
    feedback: string;
    strengths: string;
    areasOfImprovement: string;
    status: ReviewStatus;
    reviewPeriod: string;
}

export interface PerformanceReviewRequest {
    employeeId: string;
    reviewerId?: string;
    rating: number;
    feedback: string;
    strengths: string;
    areasOfImprovement: string;
    reviewPeriod: string;
    status?: ReviewStatus;
}
