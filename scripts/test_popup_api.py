import urllib.request
import json
import re

POPUP_BOOK_MAP = {
    'Genesis': 'genesis',
    'Exodus': 'exodus',
    'Leviticus': 'leviticus',
    'Numbers': 'numbers',
    'Deuteronomy': 'deuteronomy',
    'Joshua': 'joshua',
    'Judges': 'judges',
    'Ruth': 'ruth',
    '1 Samuel': '1samuel',
    '2 Samuel': '2samuel',
    '1 Kings': '1kings',
    '2 Kings': '2kings',
    '1 Chronicles': '1chronicles',
    '2 Chronicles': '2chronicles',
    'Ezra': 'ezra',
    'Nehemiah': 'nehemiah',
    'Esther': 'esther',
    'Job': 'job',
    'Psalms': 'psalms', 'Psalm': 'psalms',
    'Proverbs': 'proverbs',
    'Ecclesiastes': 'ecclesiastes',
    'Song of Solomon': 'songofsolomon',
    'Isaiah': 'isaiah',
    'Jeremiah': 'jeremiah',
    'Lamentations': 'lamentations',
    'Ezekiel': 'ezekiel',
    'Daniel': 'daniel',
    'Hosea': 'hosea',
    'Joel': 'joel',
    'Amos': 'amos',
    'Obadiah': 'obadiah',
    'Jonah': 'jonah',
    'Micah': 'micah',
    'Nahum': 'nahum',
    'Habakkuk': 'habakkuk',
    'Zephaniah': 'zephaniah',
    'Haggai': 'haggai',
    'Zechariah': 'zechariah',
    'Malachi': 'malachi',
    'Matthew': 'matthew',
    'Mark': 'mark',
    'Luke': 'luke',
    'John': 'john',
    'Acts': 'acts',
    'Romans': 'romans',
    '1 Corinthians': '1corinthians',
    '2 Corinthians': '2corinthians',
    'Galatians': 'galatians',
    'Ephesians': 'ephesians',
    'Philippians': 'philippians',
    'Colossians': 'colossians',
    '1 Thessalonians': '1thessalonians',
    '2 Thessalonians': '2thessalonians',
    '1 Timothy': '1timothy',
    '2 Timothy': '2timothy',
    'Titus': 'titus',
    'Philemon': 'philemon',
    'Hebrews': 'hebrews',
    'James': 'james',
    '1 Peter': '1peter',
    '2 Peter': '2peter',
    '1 John': '1john',
    '2 John': '2john',
    '3 John': '3john',
    'Jude': 'jude',
    'Revelation': 'revelation'
}

test_cases = [
    ('Romans', 3, '16-22'),
    ('Acts', 9, '20-22'),
    ('1 Timothy', 1, '12-16'),
    ('Genesis', 12, '1-7'),
    ('John', 1, '1-5'),
    ('Hebrews', 2, '17')
]

for book, ch, vr in test_cases:
    slug = POPUP_BOOK_MAP.get(book, book.lower().replace(' ', ''))
    url = f"https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-bsb/books/{slug}/chapters/{ch}.json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        raw_verses = data.get('data', [])
        # deduplicate
        seen = set()
        verses = []
        for item in raw_verses:
            v_num = item.get('verse')
            if v_num not in seen:
                seen.add(v_num)
                verses.append(item)
        print(f"PASS: {book} {ch} ({len(verses)} verses)")
        # filter range
        if '-' in vr:
            s, e = map(int, vr.split('-'))
        else:
            s = e = int(vr)
        matched = [v for v in verses if s <= int(v.get('verse', 0)) <= e]
        print(f"  Matched {len(matched)} verses for {book} {ch}:{vr}")
        print(f"  v{matched[0]['verse']}: {matched[0]['text'][:60]}...")
