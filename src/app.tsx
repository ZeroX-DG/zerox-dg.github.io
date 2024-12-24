import React, { useState } from "react";
import { Details } from "./sections/details/details";
import { Introduction } from "./sections/introduction/introduction";

import './app.scss';

export const App = () => {
    const [theme, setTheme] = useState('dark');
    const [language, setLanguage] = useState('EN');

    return (
        <>
            <Introduction theme={theme} onThemeChange={setTheme} language={language} onLanguageChange={setLanguage} />
            <Details />
        </>
    );
};
