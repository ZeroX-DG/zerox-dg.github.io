import React from 'react';
import { ReadingList } from '../../components/reading-list/reading-list';
import './details.scss';

export const Details = () => (
    <div id="details">
        <div className='detail'>
            <div className='detail-title'>About</div>
            <div className='detail-body'>
                <p>Hi there! I'm Viet-Hung, but I usually go by Hung.</p>
                <p>Most of the time, I'm a software engineer. But when I'm not building stuff, I like to enjoy <a href="https://letterboxd.com/viethung/films/" target="_blank">good movies</a>, listen to music, dabble in writing or reading a good novel.</p>
                <p>I'm always up for a chat at viethungax [at] gmail.com!</p>
                <p>
                    <a href="https://viethung.space/blog" target="_blank">Blog</a>{" "}•{" "}
                    <a href="https://github.com/ZeroX-DG" target="_blank">GitHub</a>{" "}•{" "}
                    <a href="https://twitter.com/itsviethung" target="_blank">Twitter</a>{" "}•{" "}
                    <a href="https://www.linkedin.com/in/v-hung/" target="_blank">LinkedIn</a>
                </p>
            </div>
        </div>
        <div className='detail'>
            <div className='detail-title'>Work</div>
            <div className='detail-body'>
                <p className='work'><span className='work-year'>2021 - Now</span>Full-stack Developer @ <a href="https://www.geneious.com/" target="_blank">Biomatters</a></p>
                <p className='work'><span className='work-year'>2019 - 2021</span>Software Engineer @ <a href="https://velocitynet.co.nz/" target="_blank">Velocitynet</a></p>
                <p className='work'><span className='work-year'>2018 - 2020</span>Maintenance Engineer @ <a href="https://boostio.co/" target="_blank">BoostIO</a></p>
            </div>
        </div>
        <div className='detail'>
            <div className='detail-title'>Projects</div>
            <div className='detail-body'>
                <p className='project'>
                    <a href="https://github.com/ZeroX-DG/raven" target="_blank">Raven:</a> A toy terminal emulator written in Rust.
                </p>
                <p className='project'>
                    <a href="https://github.com/ZeroX-DG/moon" target="_blank">Moon:</a> A web browser that I develop from scratch as a hobby.
                </p>
                <p className='project'>
                    <a href="https://limus.netlify.app/" target="_blank">Limus:</a> A tool for transforming images/screenshots.
                </p>
                <p className='project'>
                    <a href="https://viethung.space/SnippetStoreWeb/" target="_blank">Snippet Store:</a> A code snippet management for developers.
                </p>
                <p className='project'>
                    <a href="https://github.com/ZeroX-DG/CommitTasks" target="_blank">Commit Tasks:</a> A tool combining todo list & git version control.
                </p>
                <p className='project'>
                    <a href="https://viethung.space/Sonalus/index.html" target="_blank">Sonalus:</a> A modern markdown editor powered by CodeMirror.
                </p>
            </div>
        </div>
        <div className='detail'>
            <div className='detail-title'>Reading</div>
            <div className='detail-body'>
                <ReadingList />
            </div>
        </div>
    </div>
);
