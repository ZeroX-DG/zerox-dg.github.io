import React from 'react';
import { useTranslation } from 'react-i18next';
import { Toggle } from '../../components/toggle/toggle';
import './introduction.scss';

export const Introduction = ({ theme, onThemeChange, language, onLanguageChange }) => {
    const { t } = useTranslation();

    return (
        <div id="introduction">
            <p id="name">{t('Viet-Hung Nguyen')}</p>
            <p id="controls">
                <span style={{ marginRight: '22px' }}>
                    <Toggle
                        value={theme}
                        name="theme"
                        optionA={{ label: 'Light', value: 'light' }}
                        optionB={{ label: 'Dark', value: 'dark' }}
                        onChange={onThemeChange}
                    />
                </span>
                <Toggle
                    value={language}
                    name="language"
                    optionA={{ label: 'English', value: 'en' }}
                    optionB={{ label: 'Tiếng Việt', value: 'vi' }}
                    onChange={onLanguageChange}
                />
            </p>
        </div>
    );
};
