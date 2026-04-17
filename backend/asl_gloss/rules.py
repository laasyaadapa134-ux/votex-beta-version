from __future__ import annotations

from typing import Iterable, List, Sequence

from .constants import ASL_STOP_WORDS, DEPENDENCY_AUXILIARIES, DEPENDENCY_OBJECTS, DEPENDENCY_SUBJECTS, QUESTION_WORDS, TIME_INDICATORS


def token_text(token) -> str:
    return (token.lemma_ or token.text).strip().lower()


def is_time_token(token) -> bool:
    base = token_text(token)
    if base in TIME_INDICATORS:
        return True
    if token.ent_type_ in {"DATE", "TIME"}:
        return True
    return False


def is_stop_word_for_asl(token) -> bool:
    base = token_text(token)
    if base in {"not", "no", "never"}:
        return False
    return base in ASL_STOP_WORDS


def collect_time_indices(doc) -> List[int]:
    indices: List[int] = []
    for token in doc:
        if token.is_space or token.is_punct:
            continue
        if is_time_token(token):
            indices.append(token.i)
            for child in token.children:
                if child.dep_ in {"amod", "compound", "nummod"} and child.i not in indices:
                    indices.append(child.i)
    return sorted(set(indices))


def collect_group_indices(tokens: Iterable) -> List[int]:
    return sorted({token.i for token in tokens if not token.is_space and not token.is_punct})


def collect_subject_indices(doc, root) -> List[int]:
    indices = []
    for token in doc:
        if token.dep_ in DEPENDENCY_SUBJECTS and (token.head == root or token.head.head == root):
            indices.extend(collect_group_indices(token.subtree))
    return sorted(set(indices))


def collect_object_indices(doc, root) -> List[int]:
    indices = []
    for token in doc:
        if token.dep_ in DEPENDENCY_OBJECTS and (token.head == root or token.head.head == root):
            indices.extend(collect_group_indices(token.subtree))
        elif token.text.lower() in QUESTION_WORDS:
            indices.append(token.i)
    return sorted(set(indices))


def collect_verb_indices(root) -> List[int]:
    indices = [root.i]
    for child in root.children:
        if child.dep_ in DEPENDENCY_AUXILIARIES:
            indices.append(child.i)
    return sorted(set(indices))


def ordered_unique(values: Sequence[int]) -> List[int]:
    seen = set()
    ordered: List[int] = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        ordered.append(value)
    return ordered


def glossify_tokens(doc, ordered_indices: Sequence[int]) -> List[str]:
    gloss_tokens: List[str] = []
    for index in ordered_indices:
        token = doc[index]
        if token.is_space or token.is_punct or is_stop_word_for_asl(token):
            continue
        text = token_text(token).upper()
        if text:
            gloss_tokens.append(text)
    return gloss_tokens
