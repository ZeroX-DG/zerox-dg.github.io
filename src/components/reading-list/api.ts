export interface Book {
    cover: string;
    title: string;
    slug: string;
    authors: { name: string }[]
}

export const fetchReadingList = () => fetch('https://literal.club/graphql/', {
    method: 'POST',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        query: `
		query booksByReadingStateAndHandle($limit: Int!, $offset: Int!, $readingStatus: ReadingStatus!, $handle: String!) {
			booksByReadingStateAndHandle(
				limit: $limit
				offset: $offset
				readingStatus: $readingStatus
				handle: $handle
			) {
				...BookParts
				__typename
			}
		}
		
		fragment BookParts on Book {
			id
			slug
			title
			subtitle
			description
			isbn10
			isbn13
			language
			pageCount
			publishedDate
			publisher
			physicalFormat
			cover
			authors {
				...AuthorMini
				__typename
			}
			gradientColors
			workId
			__typename
		}
		
		fragment AuthorMini on Author {
			id
			name
			slug
			__typename
		}
	`,
        variables: {
            handle: 'viethung',
            readingStatus: 'IS_READING',
            limit: 10,
            offset: 0,
        },
    }),
})
.then(response => response.json())
.then(response => Promise.resolve(response.data.booksByReadingStateAndHandle as Book[]));