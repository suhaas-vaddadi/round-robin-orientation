export interface ClassifcationTaskProps {
    onContinue?: (data: unknown) => void;
}


export interface EmotionalScenerio {
    emotion: string;
    scenerio: string;
}

export interface AnsweredEmotionalScenerio {
    emotion: string;
    scenerio: string;
    rating: number;
}
export const emotionalScenerios: EmotionalScenerio[] = [
    {
        emotion: "Anger",
        scenerio: "You have been betrayed by a friend"
    },
    {
        emotion: "Anger",
        scenerio: "Someone else is to blame for the bad situation you are in."
    },
    {
        emotion: "Anger",
        scenerio: "Someone is interfering with my chance to succeed."
    },
    {
        emotion: "Anger",
        scenerio: "Someone is trying to take advantage of you."
    },
    {
        emotion: "Guilt",
        scenerio: "You have committed an act that has unintentionally had a negative impact on others."
    },
    {
        emotion: "Guilt",
        scenerio: "You are being blamed for poor performance on an assignment."
    },
    {
        emotion: "Anxiety/Fear",
        scenerio: "You are in an unknown environment."
    },
    {
        emotion: "Anxiety/Fear",
        scenerio: "You are unsure whether you can manage the situation you are in."
    },
    {
        emotion: "Happiness",
        scenerio: "You experience a situation led to a great outcome for you."
    },
    {
        emotion: "Happiness",
        scenerio: "You get what you want out of a situation."
    },
    {
        emotion: "Happiness",
        scenerio: "Things go wonderfully well for you in a situation."
    },
    {
        emotion: "Sadness",
        scenerio: "You have experienced a loss."
    },
    {
        emotion: "Sadness",
        scenerio: "Something important to you has been destroyed."
    },
    {
        emotion: "Interest",
        scenerio: "Something important has caught the interest of you."
    },
    {
        emotion: "Interest",
        scenerio: "Something being discussed relates to concerns you have dealt with in the past."
    },
    {
        emotion: "Sympathy",
        scenerio: "Another person is in a difficult situation."
    },
    {
        emotion: "Sympathy",
        scenerio: "You see another person in trouble."
    },
    {
        emotion: "Sympathy",
        scenerio: "You witness another person in need of help."
    },
    {
        emotion: "Boredom",
        scenerio: "You are in a situation that is totally unimportant."
    },
    {
        emotion: "Boredom",
        scenerio: "A discussion is occurring nearby that is none of your concern."
    },
    {
        emotion: "Boredom",
        scenerio: "You are in a situation that is not likely to impact you."
    },
    {
        emotion: "Boredom",
        scenerio: "You are in a situation that is a total waste of time."
    },
    {
        emotion: "Relief",
        scenerio: "A burden has been lifted from your mind."
    },
    {
        emotion: "Relief",
        scenerio: "You have managed to continue despite the challenges you have dealt with recently."
    }
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
