def compute_json_diff(before: dict, after: dict) -> list:
    """
    Computes a flat list of differences between two dictionaries.
    """
    if not before:
        before = {}
    if not after:
        after = {}

    all_keys = set(list(before.keys()) + list(after.keys()))
    diffs = []

    for key in all_keys:
        val_before = before.get(key)
        val_after = after.get(key)

        if key not in before:
            diffs.append({'key': key, 'old': None, 'new': val_after, 'type': 'added'})
        elif key not in after:
            diffs.append({'key': key, 'old': val_before, 'new': None, 'type': 'removed'})
        elif val_before != val_after:
            diffs.append({'key': key, 'old': val_before, 'new': val_after, 'type': 'modified'})

    diffs.sort(key=lambda x: x['key'])

    return diffs
