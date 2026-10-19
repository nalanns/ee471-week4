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