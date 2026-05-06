export type ApprovalActionType = 'APPROVE' | 'REJECT' | 'REQUEST_INFO';
export type WorkflowStatus = 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface WorkflowStep {
    id: string;
    stepOrder: number;
    name: string;
    approverRole: string;
    description: string;
}

export interface WorkflowDefinition {
    id: string;
    name: string;
    description: string;
    targetType: string;
    active: boolean;
    steps: WorkflowStep[];
}

export interface ApprovalAction {
    id: string;
    instanceId: string;
    stepId: string;
    action: ApprovalActionType;
    comment: string;
    actorId: string;
    actorName?: string;
    createdAt: string;
}

export interface WorkflowInstance {
    id: string;
    workflowId: string;
    workflowName: string;
    targetEntityId: string;
    targetEntityType: string;
    status: WorkflowStatus;
    currentStep?: WorkflowStep;
    actions: ApprovalAction[];
    createdAt: string;
    tenantId: string;
}
