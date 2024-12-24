import React from "react";
import './toggle.scss';

export const Toggle = ({ name, value, optionA, optionB, onChange }) => {
    return (
        <span className="toggle">
            <span className="option">
                <input type="radio" id={optionA.value} name={name} checked={value == optionA.value} onChange={() => onChange(optionA.value)} />
                <label htmlFor={optionA.value}>{optionA.label}</label>
            </span>
            <span className="separator"></span>
            <span className="option">
                <input type="radio" id={optionB.value} name={name} checked={value == optionB.value} onChange={() => onChange(optionB.value)} />
                <label htmlFor={optionB.value}>{optionB.label}</label>
            </span>
        </span>
    );
}
