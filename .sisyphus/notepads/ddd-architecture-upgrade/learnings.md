2026-04-27
- Extracting Todo view logic preserved an important legacy behavior: the "upcoming" filter uses string comparison against today's YYYY-MM-DD, so same-day timestamps can match both "today" and "upcoming".
- Todo tag filtering matches by tag.id, not by tag name.
