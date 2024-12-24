import React, { useEffect, useState } from "react";
import { Details } from "./sections/details/details";
import { Introduction } from "./sections/introduction/introduction";

import './app.scss';
import { useTranslation } from "react-i18next";

export const App = () => {
    const [theme, setTheme] = useState('dark');
    const [language, setLanguage] = useState('en');

    const { i18n } = useTranslation();

    const changeLanguage = (language: 'en' | 'vi') => {
        setLanguage(language);
        i18n.changeLanguage(language);
    };

    useEffect(() => {
        document.querySelector('html')!.className = 'theme-' + theme;
    });

    return (
        <>
            <Introduction theme={theme} onThemeChange={setTheme} language={language} onLanguageChange={changeLanguage} />
            <Details />
        </>
    );
};
