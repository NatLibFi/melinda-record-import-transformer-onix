export const RECORD_TYPES = {
  PRINT: 'print',
  ELECTRONIC: 'electronic'
};

export const ELECTRONIC_TEXT_FORMATS = {
  EPUB: 'EPUB',
  PDF: 'PDF'
};

export const ELECTRONIC_AUDIO_FORMATS = {
  MP3: 'MP3'
};

/*
Onix Codelists: List 150: Product form
https://ns.editeur.org/onix/en/150

PRINT:
  BA | Book
  BB | Hardback
  BC | Paperback / softback
  BD | Loose-leaf
  BE | Spiral bound
  BF | Pamphlet
  BH | Board book
  BI | Rag book
  BJ | Bath book
  BK | Novelty book
  BO | Fold-out book or chart
  BP | Foam book
  BZ | Other book format

ELECTRONICAL:
  AJ | Downloadable audio file
  AN | Downloadable and online audio file
  EA | Digital (delivered electronically)
  EB | Digital download and online
  EC | Digital online
  ED | Digital download
*/
export const ONIX_PRODUCT_FORMS_PRINT = ['BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BH', 'BI', 'BJ', 'BK', 'BO', 'BP', 'BZ'];
export const ONIX_PRODUCT_FORMS_ONLINE_AUDIO = ['AJ', 'AN'];
export const ONIX_PRODUCT_FORMS_ONLINE_TEXT = ['EA', 'EB', 'EC', 'ED'];
export const ONIX_PRODUCT_FORMS_ELECTRONIC = [...ONIX_PRODUCT_FORMS_ONLINE_AUDIO, ...ONIX_PRODUCT_FORMS_ONLINE_TEXT];

export const ONIX_PRODUCT_FORMS = Object.freeze({
  PRINT: ONIX_PRODUCT_FORMS_PRINT,
  ELECTRONIC: ONIX_PRODUCT_FORMS_ELECTRONIC,
  ONLINE_AUDIO: ONIX_PRODUCT_FORMS_ONLINE_AUDIO,
  ONLINE_TEXT: ONIX_PRODUCT_FORMS_ONLINE_TEXT
});

/*
Onix Codelists: List 175: Product form detail
https://ns.editeur.org/onix/en/175

A103 | MP3 format
E101 | EPUB
E107 | PDF
*/
export const ONIX_PRODUCT_FORM_DETAILS = {
  MP3: 'A103',
  EPUB: 'E101',
  PDF: 'E107'
};

/*
Onix Codelists: List 23: Extent type
https://ns.editeur.org/onix/en/23

00 | Main content page count
09 | Duration
10 | Notional number of pages in digital product
*/
export const EXTENT_TYPES = {
  MAIN_CONTENT_PAGE_COUNT: '00',
  DURATION: '09',
  NUMBER_OF_PAGES_DIGITAL: '10',
};

/*
Onix Codelists: List 24: Extent unit
https://ns.editeur.org/onix/en/24

03 | Pages
15 | Hours and minutes HHHMM | Fill with leading zeroes if any elements are missing
16 | Hours minutes seconds HHHMMSS | Fill with leading zeroes if any elements are missing. If centisecond precision is required, use HHHMMSScc (in ONIX 3.0 only)
*/
export const EXTENT_UNITS = {
  PAGES: '03',
  HOURS_MINUTES: '15',
  HOURS_MINUTES_SECONDS: '16'
};

export const EXTENT_TYPES_PAGE_COUNT = [EXTENT_TYPES.MAIN_CONTENT_PAGE_COUNT, EXTENT_TYPES.NUMBER_OF_PAGES_DIGITAL];


/*
Onix Codelists: List 17: Contributor role code
https://ns.editeur.org/onix/en/17

A01 | By (author)       | Author of a textual work
A06 | By (composer)     | Composer of music
A07 | By (artist)       | Visual artist when named as the primary creator of, eg, a book of reproductions of artworks
A08 | By (photographer) | Photographer when named as the primary creator of, eg, a book of photographs
A12 | Illustrated by | Artist when named as the creator of artwork which illustrates a text, or of the artwork of a graphic novel or comic book
B01 | Edited by |
B06 | Translated by |
E07 | Read by |
*/
export const MAIN_AUTHOR_ROLES = ['A01', 'A06', 'A07', 'A08'];
export const CONTRIBUTOR_ROLES = ['A12', 'B01', 'B06', 'E07'];
