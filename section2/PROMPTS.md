Prompt1 - CRUD methods
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

Prompt2 - REST API
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