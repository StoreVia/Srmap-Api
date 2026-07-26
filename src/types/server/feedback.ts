export interface Subject {
    id: string;
    name: string;
    faculty: string;
}

export interface FetchSubjectsResult {
    subjectIds: string[];
    subjects: Subject[];
    feedbackType: string | number | string[];
    mcontrollerValue: string;
}

export interface FeedbackResponse {
    success: boolean;
    message: string;
    processedSubjects?: number;
}

export interface Answer {
    questionid: string;
    answerid: string;
    answerdesc: string;
    quesid: string;
    partid: string;
    answervalue?: string;
    pointvalue?: string;
}

export interface DescriptiveAnswer {
    questionid: string;
    answerdesc: string;
    quesid: string;
    partid: string;
}