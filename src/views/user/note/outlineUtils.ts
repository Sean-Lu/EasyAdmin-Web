export interface OutlineHeadingSource {
	level: number;
	text: string;
	sourceIndex: number;
}

export interface NoteOutlineItem extends OutlineHeadingSource {
	id: string;
}

export const buildNoteOutlineItems = (headings: OutlineHeadingSource[], idPrefix: string): NoteOutlineItem[] =>
	headings
		.map(heading => ({ ...heading, text: heading.text.trim() }))
		.filter(heading => heading.text.length > 0)
		.map(heading => ({
			...heading,
			id: `${idPrefix}-${heading.sourceIndex + 1}`
		}));
