export interface ZoomMeetingConfig {
    topic: string;
    type: number; // 1 = instant, 2 = scheduled
    start_time: string;
    duration: number;
    timezone: string;
    password?: string;
    agenda?: string;
    settings: {
        host_video: boolean;
        participant_video: boolean;
        join_before_host: boolean;
        mute_upon_entry: boolean;
        watermark: boolean;
        use_pmi: boolean;
        approval_type: number;
        audio: string;
        auto_recording: string;
    };
}

export interface GoogleMeetConfig {
    summary: string;
    description?: string;
    start: {
        dateTime: string;
        timeZone: string;
    };
    end: {
        dateTime: string;
        timeZone: string;
    };
    conferenceData: {
        createRequest: {
            requestId: string;
            conferenceSolutionKey: {
                type: string;
            };
        };
    };
}

export interface GooglePlaceDetails {
    place_id: string;
    formatted_address: string;
    name: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
}
