import React from "react";
import { Details } from "./sections/details/details";
import { Introduction } from "./sections/introduction/introduction";

import './app.scss';

export const App = () => (
    <>
        <Introduction />
        <Details />
    </>
);