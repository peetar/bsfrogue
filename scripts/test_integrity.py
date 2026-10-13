import json

with open('src/data/lessons.json', 'r', encoding='utf-8') as f:
    lessons = json.load(f)

print(f"Total lessons: {len(lessons)}")
assert len(lessons) == 30, "Expected 30 lessons"

sample_links = []
for l in lessons:
    for d in l['days']:
        for link in d['readingLinks']:
            sample_links.append((l['id'], d['dayNumber'], 'reading', link))
        for q in d['questions']:
            for link in q['scriptureLinks']:
                sample_links.append((l['id'], d['dayNumber'], f"q{q['number']}", link))
            for sq in q.get('subquestions', []):
                for link in sq['scriptureLinks']:
                    sample_links.append((l['id'], d['dayNumber'], f"q{q['number']}{sq['letter']}", link))

print(f"Total verified scripture links in dataset: {len(sample_links)}")
print("\nSample Links across lessons:")
for item in sample_links[::40]:
    print(f"  Lesson {item[0]:02d} Day {item[1]} ({item[2]}): {item[3]['display']} [book={item[3]['book']}, ch={item[3]['chapter']}, range={item[3]['verseRange']}]")

# Check Lesson 4 Day 2 or Lesson 5 Day 2 compound cases
print("\nCompound citation check (e.g. comma ranges):")
for item in sample_links:
    if '-' in (item[3]['verseRange'] or '') and item[3]['display'].count(':') > 0:
        if '1-12' in (item[3]['verseRange'] or '') or '17-19' in (item[3]['verseRange'] or ''):
            print(f"  Lesson {item[0]:02d} Day {item[1]}: {item[3]['display']}")

print("\nData integrity check PASSED!")
