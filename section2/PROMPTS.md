# PROMPTS – Section 2: Library App

AI tool used: Claude Code (VSCode)

## Prompt 1 – CRUD methods (Part 2)

```
Work only in section2/. Update custom_classes.py and rewrite main.py. Keep the existing class structure and docstring style.

custom_classes.py:
1. Add two exception classes: ItemNotFoundError and ItemStateError.
2. Every item has an integer id (None until added). LibraryCollection.add_item() assigns ids 1, 2, 3, ... and returns the id. Ids are never reused, even after a delete (use a counter, not len(items)).
3. MediaItem.to_dict() returns id, type, title, author, is_available. type is "media" for MediaItem, "book" for Book, "dvd" for DVD. Book.to_dict() adds page_count, DVD.to_dict() adds duration.
4. checkout() raises ItemStateError if the item is already checked out (instead of returning "Already out"). return_item() raises ItemStateError if the item is not checked out, otherwise returns a success message.
5. DVD.checkout() must not print. Return the reminder inside the success message, e.g. "Successful checkout. Handle with care: Do not scratch the disc." Remove the old comment about matching the message.
6. Add to LibraryCollection:
   - get_item(item_id): returns the item or raises ItemNotFoundError.
   - list_items(available=None, item_type=None): returns items, filtered by availability (bool) and/or type ("book" or "dvd"). Raise ValueError for an invalid item_type.
   - update_item(item_id, **fields): only title, author, page_count (Book only), duration (DVD only) can be changed. Raise ValueError for id, type, is_available, unknown fields, or a field that does not belong to that item type. Raise ValueError for empty title/author or non-positive page_count/duration. Returns the item.
   - remove_item(item_id): raises ItemStateError if the item is checked out, otherwise removes it.
   All business rules must stay in these classes, because a Flask API will call them later.

main.py:
Create a LibraryCollection, add mixed Books and DVDs, and call every method once: add_item, get_item, list_items (no filter, available=True, item_type="dvd"), update_item, checkout (Book and DVD), return_item, remove_item, to_dict.
Then trigger each exception inside try/except and print the message: ItemNotFoundError (get_item with a wrong id), ItemStateError (checkout twice, return an available item, remove a checked-out item), ValueError (update_item with id or is_available, invalid item_type filter).
Also show that a removed id is not reused.
```

## Prompt 2 – REST API (Part 3)

```
Work only in section2/. Create app.py and requirements.txt (containing flask).

Rules:
- Routes in app.py only translate HTTP to LibraryCollection method calls. All validation and business rules stay in custom_classes.py. If something is missing there, add it to custom_classes.py:
  - LibraryCollection.create_item(data) (or similar): builds a Book or DVD from a dict with type ("book"/"dvd"), title, author, page_count or duration; raises ValueError for missing/invalid fields or unknown type; adds it and returns the item.
  - LibraryCollection.replace_item(item_id, **fields): like update_item but requires ALL editable fields for that item type (title, author, and page_count or duration); raises ValueError if any is missing.
- One LibraryCollection instance, seeded with at least 3 items, mixed Books and DVDs, with at least one checked out.
- Every response is JSON. Errors are {"error": "<message>"}. Map exceptions: ValueError -> 400, ItemNotFoundError -> 404, ItemStateError -> 409. Invalid or missing JSON body -> 400. Unknown routes and wrong methods also return JSON errors.

Endpoints:
- POST   /api/items                   -> 201 + new item (to_dict), 400
- GET    /api/items                   -> 200 list; supports ?available=true|false and ?type=book|dvd; 400 for a bad filter value
- GET    /api/items/<int:id>          -> 200 item, 404
- PUT    /api/items/<int:id>          -> 200 item, 400, 404 (replace all editable fields)
- PATCH  /api/items/<int:id>          -> 200 item, 400, 404 (change some editable fields)
- DELETE /api/items/<int:id>          -> 204 empty body, 404, 409 if checked out
- POST   /api/items/<int:id>/checkout -> 200 {"message": ..., "item": ...}, 404, 409 already out
- POST   /api/items/<int:id>/return   -> 200 {"message": ..., "item": ...}, 404, 409 not checked out

Run with app.run(debug=True, port=5000). Don't create any frontend yet.
```

## Prompt 3 – Frontend (Part 4)

```
Work only in section2/. Build the frontend for the library API and serve it from Flask.

- Flask serves the page at "/": section2/templates/index.html, section2/static/style.css, section2/static/script.js. Keep all existing API routes unchanged.
- Match the Figma design in design/library.png: header "My library" with an "Add Item" button, a toolbar with an "Available only" toggle and an All / Book / DVD type filter, an error message area, a grid of item cards, an empty state ("No items yet"), and an Add/Edit modal form.
- Item card: title, author, type badge, page count (book) or duration in minutes (DVD), availability badge, a Checkout button (or Return if checked out), an edit icon and a delete icon.
- Add/Edit form: title, author, type selector (Book/DVD), and one number field whose label switches between "Page count" and "Duration (min)" based on type. Editing an existing item uses PATCH and the type cannot be changed.
- The frontend must use the API for everything:
  - Filtering uses GET /api/items?available=true&type=book (query params), not filtering in JavaScript.
  - After every create, update, delete, checkout or return, reload the list from the API.
  - No validation or business rules duplicated in JavaScript; the API decides.
- Error handling: if a response is not ok, read {"error": "..."} from the body and show that message in the error area (e.g. the 409 when deleting a checked-out item). The error area is hidden when there is no error and can be closed.
- DELETE returns 204 with an empty body; do not call response.json() on it.
- Show the empty state when the list is empty.
```

## Things the AI got wrong (and how I fixed them)

I reviewed the generated `script.js` before committing and found two problems.

**1. The checkout message was ignored.**
The API returns the DVD care reminder inside the checkout message (`{"message": ..., "item": ...}`), but the generated `runAction()` discarded the response. The reminder "Handle with care: Do not scratch the disc." was never shown to the user.

**2. The availability summary was misleading under filters.**
The "X available · Y checked out" counts were computed in JavaScript from the already filtered list. With "Available only" on, the summary always showed "0 checked out".

**Fix prompt:**

```
Two fixes in section2/static (frontend only, don't change the API):
1. After a successful checkout or return, the API returns {"message": ..., "item": ...}, but runAction ignores it, so the DVD reminder "Handle with care: Do not scratch the disc." is never shown. Show the API's message in a green, closable success notice next to the error area.
2. The "X available · Y checked out" summary is computed in JavaScript from the filtered list, so with "Available only" on it always shows "0 checked out". Only show this summary when no filter is active.
```

**Result:**
- Checking out a DVD now shows "Successful checkout. Handle with care: Do not scratch the disc." in a green notice. A return shows "Successful return".
- The summary is shown only when no filter is active.
- The API was not changed. The green notice's HTML was added to `templates/index.html`, right after the error area.