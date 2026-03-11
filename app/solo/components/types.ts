export interface ClassifcationTaskProps {
    onContinue?: (data: unknown) => void;
    loading?: boolean;
    initialData?: any;
}


export const EMOTIONS = [
    "Anger",
    "Guilt",
    "Sadness",
    "Sympathy",
    "Happiness",
    "Anxiety",
    "Boredom",
    "Interest",
    "Relief"
] as const;

export type Emotion = typeof EMOTIONS[number];

export const EMOTION_GROUPS = [
    ["Anger", "Sadness", "Happiness"],
    ["Guilt", "Sympathy", "Anxiety"],
    ["Boredom", "Interest", "Relief"]
] as const;

export interface EmotionalScenerioType {
    text: string;
    groupIndex: number; // 0, 1, or 2 for EMOTION_GROUPS
}

export interface AnsweredEmotionalScenerio {
    scenerio: EmotionalScenerioType;
    ratings: Record<string, number>;
    questionIndex: number;
}

export const yourselfEmotionalScenerios: EmotionalScenerioType[] = [
    { text: "You have been betrayed by a friend.", groupIndex: 0 },
    { text: "Someone else is to blame for the bad situation you are in.", groupIndex: 0 },
    { text: "Something important to you has been destroyed.", groupIndex: 0 },
    { text: "Someone is trying to take advantage of you.", groupIndex: 0 },
    { text: "You have experienced the loss of a friendship.", groupIndex: 0 },
    { text: "You are being blamed for poor performance on an assignment.", groupIndex: 1 },
    { text: "You have committed an act that has unintentionally had a negative impact on others.", groupIndex: 1 },
    { text: "You are in an unfamiliar environment.", groupIndex: 1 },
    { text: "You are unsure whether you are prepared for the situation you are in.", groupIndex: 1 },
    { text: "Your hard word allows you to reach a goal.", groupIndex: 2 },
    { text: "You confront a challenge which leads to a great outcome for you.", groupIndex: 2 },
    { text: "Your presence in a group makes your peers engaged and excited.", groupIndex: 2 },
    { text: "A new and very ambitious idea has been brought to your attention.", groupIndex: 2 }

];

export const averageUWEmotionalScenerios: EmotionalScenerioType[] = [
    { text: "They have been betrayed by a friend.", groupIndex: 0 },
    { text: "Someone else is to blame for the bad situation they are in.", groupIndex: 0 },
    { text: "Something important to them has been destroyed.", groupIndex: 0 },
    { text: "Someone is trying to take advantage of them.", groupIndex: 0 },
    { text: "They have experienced the loss of a friendship.", groupIndex: 0 },
    { text: "They are being blamed for poor performance on an assignment.", groupIndex: 1 },
    { text: "They have committed an act that has unintentionally had a negative impact on others.", groupIndex: 1 },
    { text: "They are in an unfamiliar environment.", groupIndex: 1 },
    { text: "They are unsure whether they are prepared for the situation they are in.", groupIndex: 1 },
    { text: "Their hard word allows them to reach a goal.", groupIndex: 2 },
    { text: "They confront a challenge which leads to a great outcome for them.", groupIndex: 2 },
    { text: "Their presence in a group makes their peers engaged and excited.", groupIndex: 2 },
    { text: "A new and very ambitious idea has been brought to their attention.", groupIndex: 2 }
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
        participantId: string;
        fullName: string;
        email: string;
    };
    csvFilePath: string;
    onComplete?: () => void;
}
