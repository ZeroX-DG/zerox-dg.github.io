import React from 'react';
import { Toggle } from '../../components/toggle/toggle';
import './introduction.scss';

export const Introduction = ({ theme, onThemeChange, language, onLanguageChange }) => (
    <div id="introduction">
        <p id="name">Viet-Hung Nguyen</p>
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
                optionA={{ label: 'English', value: 'EN' }}
                optionB={{ label: 'Tiếng Việt', value: 'VI' }}
                onChange={onLanguageChange}
            />
        </p>
    </div>
);
