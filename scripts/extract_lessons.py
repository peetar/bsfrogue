import zipfile
import xml.etree.ElementTree as ET
import glob
import re
import json
import os

BOOK_NAMES = {
    'Genesis': 'gen', 'Gen': 'gen',
    'Exodus': 'exo', 'Exod': 'exo', 'Ex': 'exo',
    'Leviticus': 'lev', 'Lev': 'lev',
    'Numbers': 'num', 'Num': 'num',
    'Deuteronomy': 'deu', 'Deut': 'deu',
    'Joshua': 'jos', 'Josh': 'jos',
    'Judges': 'jdg', 'Judg': 'jdg',
    'Ruth': 'rut',
    '1 Samuel': '1sa', '1 Sam': '1sa',
    '2 Samuel': '2sa', '2 Sam': '2sa',
    '1 Kings': '1ki', '1 Kgs': '1ki',
    '2 Kings': '2ki', '2 Kgs': '2ki',
    '1 Chronicles': '1ch', '1 Chron': '1ch', '1 Chr': '1ch',
    '2 Chronicles': '2ch', '2 Chron': '2ch', '2 Chr': '2ch',
    'Ezra': 'ezr',
    'Nehemiah': 'neh', 'Neh': 'neh',
    'Esther': 'est', 'Esth': 'est',
    'Job': 'job',
    'Psalms': 'psa', 'Psalm': 'psa', 'Ps': 'psa',
    'Proverbs': 'pro', 'Prov': 'pro', 'Pr': 'pro',
    'Ecclesiastes': 'ecc', 'Eccl': 'ecc',
    'Song of Solomon': 'sng', 'Song': 'sng',
    'Isaiah': 'isa', 'Isa': 'isa',
    'Jeremiah': 'jer', 'Jer': 'jer',
    'Lamentations': 'lam', 'Lam': 'lam',
    'Ezekiel': 'ezk', 'Ezek': 'ezk',
    'Daniel': 'dan', 'Dan': 'dan',
    'Hosea': 'hos', 'Hos': 'hos',
    'Joel': 'joe',
    'Amos': 'amo',
    'Obadiah': 'oba', 'Obad': 'oba',
    'Jonah': 'jon',
    'Micah': 'mic', 'Mic': 'mic',
    'Nahum': 'nam', 'Nah': 'nam',
    'Habakkuk': 'hab', 'Hab': 'hab',
    'Zephaniah': 'zep', 'Zeph': 'zep',
    'Haggai': 'hag', 'Hag': 'hag',
    'Zechariah': 'zec', 'Zech': 'zec',
    'Malachi': 'mal', 'Mal': 'mal',
    'Matthew': 'mat', 'Matt': 'mat', 'Mt': 'mat',
    'Mark': 'mar', 'Mk': 'mar',
    'Luke': 'luk', 'Lk': 'luk',
    'John': 'jhn', 'Jn': 'jhn',
    'Acts': 'act', 'Ac': 'act',
    'Romans': 'rom', 'Rom': 'rom',
    '1 Corinthians': '1co', '1 Cor': '1co',
    '2 Corinthians': '2co', '2 Cor': '2co',
    'Galatians': 'gal', 'Gal': 'gal',
    'Ephesians': 'eph', 'Eph': 'eph',
    'Philippians': 'phl', 'Phil': 'phl',
    'Colossians': 'col', 'Col': 'col',
    '1 Thessalonians': '1th', '1 Thess': '1th',
    '2 Thessalonians': '2th', '2 Thess': '2th',
    '1 Timothy': '1ti', '1 Tim': '1ti',
    '2 Timothy': '2ti', '2 Tim': '2ti',
    'Titus': 'tit', 'Tit': 'tit',
    'Philemon': 'phm', 'Phlm': 'phm',
    'Hebrews': 'heb', 'Heb': 'heb',
    'James': 'jas', 'Jas': 'jas',
    '1 Peter': '1pe', '1 Pet': '1pe',
    '2 Peter': '2pe', '2 Pet': '2pe',
    '1 John': '1jo', '1 Jn': '1jo',
    '2 John': '2jo', '2 Jn': '2jo',
    '3 John': '3jo', '3 Jn': '3jo',
    'Jude': 'jde', 'Jud': 'jde',
    'Revelation': 'rev', 'Rev': 'rev'
}

sorted_books = sorted(BOOK_NAMES.keys(), key=len, reverse=True)
book_re_str = '|'.join(map(re.escape, sorted_books))

def extract_scripture_links(text, default_book='Romans'):
    if not text:
        return []
    links = []
    last_book = default_book
    last_book_abbr = BOOK_NAMES.get(default_book, 'rom')

    # Regex matches:
    # 1. Book? Chapter:Verses (e.g. Romans 3:16-22, 1-12, or just 2:1-5)
    # 2. Book Chapter (e.g. Romans 3)
    regex = rf'(?:({book_re_str})\s+)?(\d+):(\d+(?:[-–]\d+)?(?:\s*,\s*\d+(?:[-–]\d+)?)*)|\b({book_re_str})\s+(\d+)\b'
    for m in re.finditer(regex, text, re.IGNORECASE):
        b1, ch1, v1, b2, ch2 = m.groups()
        if b2: # Chapter only like "Romans 3"
            canonical = next((b for b in sorted_books if b.lower() == b2.lower()), b2)
            abbr = BOOK_NAMES.get(canonical, 'rom')
            last_book = canonical
            last_book_abbr = abbr
            links.append({
                'display': f"{canonical} {ch2}",
                'book': canonical,
                'bookAbbr': abbr,
                'chapter': int(ch2),
                'verseRange': None
            })
        elif ch1 and v1:
            if b1:
                canonical = next((b for b in sorted_books if b.lower() == b1.lower()), b1)
                abbr = BOOK_NAMES.get(canonical, 'rom')
                last_book = canonical
                last_book_abbr = abbr
            else:
                canonical = last_book
                abbr = last_book_abbr
            
            parts = [p.strip().replace('–', '-') for p in v1.split(',')]
            for p in parts:
                links.append({
                    'display': f"{canonical} {ch1}:{p}",
                    'book': canonical,
                    'bookAbbr': abbr,
                    'chapter': int(ch1),
                    'verseRange': p
                })
    return links

DAY_NAMES_MAP = {
    'First Day': 1,
    'Second Day': 2,
    'Third Day': 3,
    'Fourth Day': 4,
    'Fifth Day': 5,
    'Sixth Day': 6
}

def clean_text(s):
    if not s:
        return ""
    # Clean up standard quote representations
    s = s.replace('\u201c', '"').replace('\u201d', '"')
    s = s.replace('\u2018', "'").replace('\u2019', "'")
    s = s.replace('\u2013', '-').replace('\u2014', '--')
    return s.strip()

def parse_docx(file_path):
    with zipfile.ZipFile(file_path) as z:
        xml_content = z.read('word/document.xml')
    root = ET.fromstring(xml_content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    paragraphs = root.findall('.//w:p', ns)

    lesson_title = ""
    passage = ""
    lesson_num = 0

    # Extract header info
    for p in paragraphs[:25]:
        pStyle = p.find('.//w:pStyle', ns)
        s_val = pStyle.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') if pStyle is not None else ''
        text = ''.join([t.text for t in p.findall('.//w:t', ns) if t.text]).strip()
        if s_val == 'ChapterRange' and not passage:
            passage = clean_text(text)
        m = re.match(r'Lesson\s+(\d+)', text, re.IGNORECASE)
        if m and not lesson_num:
            lesson_num = int(m.group(1))
        if s_val in ['Title1', ''] and text and not text.startswith('Lesson') and not text.startswith('Romans') and s_val != 'BibleStudyFellowshipFooter' and not lesson_title:
            lesson_title = clean_text(text)

    # Special fallbacks
    if lesson_num == 30 and not passage:
        passage = "Romans Review"
    if not lesson_title:
        lesson_title = f"Lesson {lesson_num}"

    days = []
    current_day = None
    q_counter = 0

    for p in paragraphs:
        pStyle = p.find('.//w:pStyle', ns)
        s_val = pStyle.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') if pStyle is not None else ''
        numPr = p.find('.//w:numPr', ns)
        numId_el = numPr.find('.//w:numId', ns) if numPr is not None else None
        numId_val = numId_el.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') if numId_el is not None else None
        
        texts = [t.text for t in p.findall('.//w:t', ns) if t.text]
        text = clean_text(''.join(texts))
        if not text and s_val != 'Heading4':
            continue

        if s_val == 'Heading4':
            day_num = len(days) + 1
            for k, v in DAY_NAMES_MAP.items():
                if k.lower() in text.lower():
                    day_num = v
                    break
            
            # Extract reading passage from title
            reading_match = re.search(r'Read\s+([^.]+)', text, re.IGNORECASE)
            reading_passage = reading_match.group(1).strip() if reading_match else ""
            if not reading_passage and 'Review' in text:
                rev_match = re.search(r'Review\s+([^.]+)', text, re.IGNORECASE)
                if rev_match:
                    reading_passage = rev_match.group(1).strip()

            current_day = {
                'dayNumber': day_num,
                'title': text,
                'readingPassage': reading_passage,
                'readingLinks': extract_scripture_links(reading_passage),
                'summary': '',
                'questions': []
            }
            days.append(current_day)
        elif s_val == 'DaySummaryItal':
            if current_day and text:
                if current_day['summary']:
                    current_day['summary'] += ' ' + text
                else:
                    current_day['summary'] = text
        elif s_val == 'Question':
            if numId_val == '0':
                # Continuation paragraph
                if current_day and current_day['questions']:
                    last_q = current_day['questions'][-1]
                    if last_q.get('subquestions'):
                        last_q['subquestions'][-1]['text'] += ' ' + text
                        last_q['subquestions'][-1]['scriptureLinks'] = extract_scripture_links(last_q['subquestions'][-1]['text'])
                    else:
                        last_q['text'] += ' ' + text
                        last_q['scriptureLinks'] = extract_scripture_links(last_q['text'])
            else:
                q_counter += 1
                q_id = f"l{lesson_num}_q{q_counter}"
                # Check if it starts with 'a.'
                a_match = re.match(r'^a\.\s*(.*)', text, re.IGNORECASE)
                if a_match:
                    sub_text = a_match.group(1).strip()
                    sub_id = f"{q_id}_a"
                    q_obj = {
                        'id': q_id,
                        'number': q_counter,
                        'text': '',
                        'scriptureLinks': [],
                        'subquestions': [
                            {
                                'id': sub_id,
                                'letter': 'a',
                                'text': sub_text,
                                'scriptureLinks': extract_scripture_links(sub_text)
                            }
                        ]
                    }
                else:
                    q_obj = {
                        'id': q_id,
                        'number': q_counter,
                        'text': text,
                        'scriptureLinks': extract_scripture_links(text),
                        'subquestions': []
                    }
                if current_day:
                    current_day['questions'].append(q_obj)
        elif s_val == 'Pointb':
            if current_day and current_day['questions']:
                last_q = current_day['questions'][-1]
                # Check letter like "b." or "c."
                m = re.match(r'^([b-z])\.\s*(.*)', text, re.IGNORECASE)
                letter = m.group(1).lower() if m else 'b'
                sub_text = m.group(2).strip() if m else text
                sub_id = f"{last_q['id']}_{letter}"
                if 'subquestions' not in last_q:
                    last_q['subquestions'] = []
                last_q['subquestions'].append({
                    'id': sub_id,
                    'letter': letter,
                    'text': sub_text,
                    'scriptureLinks': extract_scripture_links(sub_text)
                })

    return {
        'id': lesson_num,
        'title': lesson_title,
        'passage': passage,
        'book': 'Romans',
        'days': days
    }

def main():
    os.makedirs('src/data', exist_ok=True)
    files = sorted(glob.glob('doc-dump/ROM_AdQ_*.docx'))
    print(f"Found {len(files)} files to extract.")
    lessons = []
    for f in files:
        lesson = parse_docx(f)
        lessons.append(lesson)
        print(f"Extracted Lesson {lesson['id']:02d}: {lesson['title']} ({lesson['passage']})")

    out_path = 'src/data/lessons.json'
    with open(out_path, 'w', encoding='utf-8') as f_out:
        json.dump(lessons, f_out, indent=2, ensure_ascii=False)
    print(f"Successfully generated {out_path} with {len(lessons)} lessons!")

if __name__ == '__main__':
    main()
