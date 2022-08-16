import React, { useEffect, useState } from 'react';
import { Book, fetchReadingList } from './api';

import './reading-list.scss';

export const ReadingList = () => {
    const [readingList, setReadingList] = useState([] as Book[]);

    useEffect(() => {
        fetchReadingList()
            .then(readingList => {console.log(readingList); setReadingList(readingList)});
    }, []);

    return (
        <div id="reading-list">
            {readingList.map(book => (
                <a className='book' href={`https://literal.club/viethung/book/${book.slug}`} target="_blank">
                    <div className='book-cover'>
                        {book.cover ? (
                            <img src={book.cover} />
                        ) : (
                            <div className='fallback-cover'>
                                <p className='author'>{book.authors.map(author => author.name).join(', ')}</p>
                                <p className='title'>{book.title}</p>
                            </div>
                        )}
                    </div>
                    <div className='book-info'>
                        <p className='title'>{book.title}</p>
                        <p className='author'>{book.authors.map(author => author.name).join(', ')}</p>
                    </div>
                </a>
            ))}
        </div>
    );
};
