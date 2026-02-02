export interface ClassifcationTaskProps {
    onContinue?: (data: any) => void;
}

export const emotionTransitions = [
    { initial: "assertive", final: "confident" },
    // { initial: "assertive", final: "grouchy" },
    // { initial: "assertive", final: "sad" },
    // { initial: "assertive", final: "assertive" },
    // { initial: "assertive", final: "unrestrained" },
    // { initial: "confident", final: "confident" },
    // { initial: "confident", final: "grouchy" },
    // { initial: "confident", final: "sad" },
    // { initial: "confident", final: "assertive" },
    // { initial: "confident", final: "unrestrained" },
    // { initial: "grouchy", final: "confident" },
    // { initial: "grouchy", final: "grouchy" },
    // { initial: "grouchy", final: "sad" },
    // { initial: "grouchy", final: "assertive" },
    // { initial: "grouchy", final: "unrestrained" },
    // { initial: "sad", final: "confident" },
    // { initial: "sad", final: "grouchy" },
    // { initial: "sad", final: "sad" },
    // { initial: "sad", final: "assertive" },
    // { initial: "sad", final: "unrestrained" },
    // { initial: "unrestrained", final: "confident" },
    // { initial: "unrestrained", final: "grouchy" },
    // { initial: "unrestrained", final: "sad" },
    // { initial: "unrestrained", final: "assertive" },
    // { initial: "unrestrained", final: "unrestrained" },
    // { initial: "bold", final: "nervous" },
    // { initial: "bold", final: "irritable" },
    // { initial: "bold", final: "lively" },
    // { initial: "bold", final: "bold" },
    // { initial: "bold", final: "talkative" },
    // { initial: "irritable", final: "nervous" },
    // { initial: "irritable", final: "irritable" },
    // { initial: "irritable", final: "lively" },
    // { initial: "irritable", final: "bold" },
    // { initial: "irritable", final: "talkative" },
    // { initial: "lively", final: "nervous" },
    // { initial: "lively", final: "irritable" },
    // { initial: "lively", final: "lively" },
    // { initial: "lively", final: "bold" },
    // { initial: "lively", final: "talkative" },
    // { initial: "nervous", final: "nervous" },
    // { initial: "nervous", final: "irritable" },
    // { initial: "nervous", final: "lively" },
    // { initial: "nervous", final: "bold" },
    // { initial: "nervous", final: "talkative" },
    // { initial: "talkative", final: "nervous" },
    // { initial: "talkative", final: "irritable" },
    // { initial: "talkative", final: "lively" },
    // { initial: "talkative", final: "bold" },
    // { initial: "talkative", final: "talkative" },
    // { initial: "contempt", final: "satisfaction" },
    // { initial: "contempt", final: "love" },
    // { initial: "contempt", final: "contempt" },
    // { initial: "contempt", final: "disgust" },
    // { initial: "contempt", final: "embarrassment" },
    // { initial: "disgust", final: "satisfaction" },
    // { initial: "disgust", final: "love" },
    // { initial: "disgust", final: "contempt" },
    // { initial: "disgust", final: "disgust" },
    // { initial: "disgust", final: "embarrassment" },
    // { initial: "embarrassment", final: "satisfaction" },
    // { initial: "embarrassment", final: "love" },
    // { initial: "embarrassment", final: "contempt" },
    // { initial: "embarrassment", final: "disgust" },
    // { initial: "embarrassment", final: "embarrassment" },
    // { initial: "love", final: "satisfaction" },
    // { initial: "love", final: "love" },
    // { initial: "love", final: "contempt" },
    // { initial: "love", final: "disgust" },
    // { initial: "love", final: "embarrassment" },
    // { initial: "satisfaction", final: "satisfaction" },
    // { initial: "satisfaction", final: "love" },
    // { initial: "satisfaction", final: "contempt" },
    // { initial: "satisfaction", final: "disgust" },
    // { initial: "satisfaction", final: "embarrassment" },
];


export interface AvailabilityData {
    availability: Record<string, boolean>;
}

export interface OutstandingDatesData {
    outstandingDates: string;
}

export interface PartnerHistoryData {
    partnerHistory: boolean;
    partnerHistoryMonths: string;
    matrixSelections: Record<number, number>;
}

export interface SelfFrequencyData {
    order: string[];
    ratings: Record<string, string | number>;
}

export interface MatrixData {
    order: string[];
    matrixSelections: Record<number, number>;
}

export interface ExperienceData {
    sync: number;
    wavelength: number;
    text: string;
}

export interface StudyFeedbackData {
    text: string;
}

export interface PartnerSlidersData {
    order: string[];
    sliderSelections: Record<number, number>;
}

export interface TransitionRating {
    initial: string;
    final: string;
    rating: number;
    person?: string;
}

export type StepData =
    | AvailabilityData
    | OutstandingDatesData
    | PartnerHistoryData
    | SelfFrequencyData
    | MatrixData
    | ExperienceData
    | StudyFeedbackData
    | PartnerSlidersData;

export interface ClassificationTaskMainProps {
    formData: {
        dyadId: string;
        participantId: string;
        subjectInitials: string;
        raName: string;
        sessionTime: string;
        sessionDate: string;
    };
    csvFilePath: string;
    onComplete?: () => void;
}
