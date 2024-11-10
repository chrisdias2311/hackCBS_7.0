import { createContext, useState } from "react";

export const emotionsContext = createContext();

const EmotionsProvider = ({ children }) => {

    const [textEmotions, setTextEmotions] = useState(null);
    const [videoEmotions, setVideoEmotions] = useState(null);
    const [audioEmotions, setAudioEmotions] = useState(null);
    const [overAllEmotions, setOverAllEmotions] = useState(null);
    const [studentLiveEmotions, setStudentLiveEmotions] = useState(null);
    const [lastSync, setLastSync] = useState(0);


    return (

        <emotionsContext.Provider value={{
            textEmotions, setTextEmotions, videoEmotions,
            setVideoEmotions, audioEmotions, setAudioEmotions, overAllEmotions, setOverAllEmotions,
            studentLiveEmotions, setStudentLiveEmotions, lastSync, setLastSync
        }}>
            {children}
        </emotionsContext.Provider>
    )
}

export default EmotionsProvider;