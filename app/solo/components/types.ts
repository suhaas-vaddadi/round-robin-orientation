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
    "Anxiety"
] as const;

export type Emotion = typeof EMOTIONS[number];

export interface AnsweredEmotionalScenerio {
    scenerio: string;
    ratings: Record<string, number>;
    questionIndex: number;
}


export const yourselfEmotionalScenerios: string[] = [
    "You have been betrayed by a friend.",
    "Someone else is to blame for the bad situation you are in.",
    "Someone is interfering with my chance to succeed.",
    "Someone is trying to take advantage of you.",
    "You have committed an act that has unintentionally had a negative impact on others.",
    "You are being blamed for poor performance on an assignment.",
    "You are in an unknown environment.",
    "You are unsure whether you can manage the situation you are in.",
    "You experience a situation led to a great outcome for you.",
    "You get what you want out of a situation.",
    "Things go wonderfully well for you in a situation.",
    "You have experienced a loss.",
    "Something important to you has been destroyed.",
    "Something important has caught the interest of you.",
    "Something being discussed relates to concerns you have dealt with in the past.",
    "Another person is in a difficult situation.",
    "You see another person in trouble.",
    "You witness another person in need of help.",
    "You are in a situation that is totally unimportant.",
    "A discussion is occurring nearby that is none of your concern.",
    "You are in a situation that is not likely to impact you.",
    "You are in a situation that is a total waste of time.",
    "A burden has been lifted from your mind.",
    "You have managed to continue despite the challenges you have dealt with recently."
];

export const averageUWEmotionalScenerios: string[] = [
    "They have been betrayed by a friend.",
    "Someone else is to blame for the bad situation they are in.",
    "Someone is interfering with their chance to succeed.",
    "Someone is trying to take advantage of them.",
    "They have committed an act that has unintentionally had a negative impact on others.",
    "They are being blamed for poor performance on an assignment.",
    "They are in an unknown environment.",
    "They are unsure whether they can manage the situation they are in.",
    "They experience a situation led to a great outcome for them.",
    "They get what they want out of a situation.",
    "Things go wonderfully well for them in a situation.",
    "They have experienced a loss.",
    "Something important to them has been destroyed.",
    "Something important has caught the interest of them.",
    "Something being discussed relates to concerns they have dealt with in the past.",
    "Another person is in a difficult situation.",
    "They see another person in trouble.",
    "They witness another person in need of help.",
    "They are in a situation that is totally unimportant.",
    "A discussion is occurring nearby that is none of their concern.",
    "They are in a situation that is not likely to impact them.",
    "They are in a situation that is a total waste of time.",
    "A burden has been lifted from their mind.",
    "They have managed to continue despite the challenges they have dealt with recently."
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
        raName: string;
        sessionTime: string;
        sessionDate: string;
    };
    csvFilePath: string;
    onComplete?: () => void;
}
