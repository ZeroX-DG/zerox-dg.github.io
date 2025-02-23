import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReadingList } from '../../components/reading-list/reading-list';
import './details.scss';

export const Details = () => {
    const [hour, setHour] = useState('');
    const [min, setMin] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        const updateTime = () => {
            const options: Intl.DateTimeFormatOptions = {
                timeZone: "Pacific/Auckland",
                timeStyle: "short",
                hour12: false
            };
            const time = new Intl.DateTimeFormat(navigator.language || "zh-TW", options).format(new Date());

            const [currentHour, currentMinute] = time.split(':');

            setHour(currentHour);
            setMin(currentMinute);

            const now = new Date();
            const sec = now.getSeconds();

            const delay = 60000 - ((sec * 1000) + now.getMilliseconds());
            setTimeout(updateTime, delay);
        };
        updateTime();
    });

    return (
        <div id="details">
            <div className='detail'>
                <div className='detail-title'>{t(`About`)}</div>
                <div className='detail-body'>
                    <p>{t(`Hi there! I'm Viet-Hung, but I usually go by Hung.`)}</p>
                    <p>{t(`I'm based in Auckland, New Zealand, where it's currently`)} {hour}<span className="colon">:</span>{min}.</p>
                    <p>{t(`I'm a software engineer most of the time. But when I'm not building stuff, I enjoy good films, music, playing guitar, dabbling in writing, or reading a good novel.`)}</p>
                    <p>
                        <a href="https://viethung.space/blog" target="_blank">Blog</a>{" "}•{" "}
                        <a href="https://github.com/ZeroX-DG" target="_blank">GitHub</a>{" "}•{" "}
                        <a href="https://twitter.com/itsviethung" target="_blank">Twitter</a>{" "}•{" "}
                        <a href="https://www.linkedin.com/in/v-hung/" target="_blank">LinkedIn</a>{" "}
                    </p>
                    <p>
                        <a href="https://literal.club/viethung" target="_blank">Literal</a>{" "}•{" "}
                        <a href="https://letterboxd.com/viethung/films/" target="_blank">Letterboxd</a>
                    </p>
                </div>
            </div>
            <div className='detail'>
                <div className='detail-title'>{t(`Work`)}</div>
                <div className='detail-body'>
                    <table className='work'>
                        <tr>
                            <td className='work-year'>2021 - {t(`Now`)}</td>
                            <td>Full-stack Developer @ <a href="https://www.geneious.com/" target="_blank">Biomatters</a></td>
                        </tr>
                        <tr>
                            <td className='work-year'>2019 - 2021</td>
                            <td>Software Engineer @ <a href="https://velocitynet.co.nz/" target="_blank">Velocitynet</a></td>
                        </tr>
                        <tr>
                            <td className='work-year'>2018 - 2020</td>
                            <td>Maintenance Engineer @ <a href="https://boostio.co/" target="_blank">BoostIO</a></td>
                        </tr>
                    </table>
                </div>
            </div>
            <div className='detail'>
                <div className='detail-title'>{t(`Projects`)}</div>
                <div className='detail-body'>
                    <p className='project'>
                        <a href="https://github.com/ZeroX-DG/raven" target="_blank">Raven:</a> {t(`A toy terminal emulator written in Rust.`)}
                    </p>
                    <p className='project'>
                        <a href="https://github.com/ZeroX-DG/moon" target="_blank">Moon:</a> {t(`A web browser that I develop from scratch as a hobby.`)}
                    </p>
                    <p className='project'>
                        <a href="https://limus.netlify.app/" target="_blank">Limus:</a> {t(`A tool for transforming images/screenshots.`)}
                    </p>
                    <p className='project'>
                        <a href="https://viethung.space/SnippetStoreWeb/" target="_blank">Snippet Store:</a> {t(`A code snippet management for developers.`)}
                    </p>
                    <p className='project'>
                        <a href="https://github.com/ZeroX-DG/CommitTasks" target="_blank">Commit Tasks:</a> {t(`A tool combining todo list & git version control.`)}
                    </p>
                    <p className='project'>
                        <a href="https://viethung.space/Sonalus/index.html" target="_blank">Sonalus:</a> {t(`A modern markdown editor powered by CodeMirror.`)}
                    </p>
                </div>
            </div>
            <div className='detail'>
                <div className='detail-title'>{t(`Reading`)}</div>
                <div className='detail-body'>
                    <ReadingList />
                </div>
            </div>
        </div>
    );
}
