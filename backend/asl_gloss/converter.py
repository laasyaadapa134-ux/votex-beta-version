from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from typing import Dict, List

try:
    import spacy
except ImportError:
    spacy = None

from .rules import (
    collect_object_indices,
    collect_subject_indices,
    collect_time_indices,
    collect_verb_indices,
    glossify_tokens,
    ordered_unique,
)


@dataclass
class ASLGlossResult:
    source_text: str
    normalized_text: str
    gloss_tokens: List[str]

    @property
    def gloss(self) -> str:
        return " ".join(self.gloss_tokens)


@lru_cache(maxsize=1)
def get_nlp():
    if spacy is None:
        return None

    try:
        return spacy.load("en_core_web_sm")
    except OSError:
        # Fallback keeps tokenization working even if the model is not installed yet.
        return spacy.blank("en")


def english_to_asl_gloss(sentence: str) -> str:
    return english_to_asl_gloss_data(sentence).gloss


def english_to_asl_gloss_data(sentence: str) -> Dict[str, object]:
    result = _convert_sentence(sentence)
    return {
        "source_text": result.source_text,
        "normalized_text": result.normalized_text,
        "gloss_tokens": result.gloss_tokens,
        "gloss": result.gloss,
    }


def _convert_sentence(sentence: str) -> ASLGlossResult:
    cleaned = (sentence or "").strip()
    if not cleaned:
        return ASLGlossResult(source_text="", normalized_text="", gloss_tokens=[])

    nlp = get_nlp()
    if nlp is None:
        tokens = [part.strip(".,!?;:") for part in cleaned.split() if part.strip(".,!?;:")]
        return ASLGlossResult(
            source_text=cleaned,
            normalized_text=" ".join(tokens),
            gloss_tokens=[token.upper() for token in tokens if token],
        )

    doc = nlp(cleaned)
    if not doc:
        return ASLGlossResult(source_text=cleaned, normalized_text=cleaned, gloss_tokens=[])

    time_indices = collect_time_indices(doc)

    if doc.has_annotation("DEP"):
        root = next((token for token in doc if token.dep_ == "ROOT"), None)
    else:
        root = next((token for token in doc if not token.is_space and not token.is_punct), None)

    if root is None:
        return ASLGlossResult(source_text=cleaned, normalized_text=cleaned, gloss_tokens=[])

    subject_indices = collect_subject_indices(doc, root) if doc.has_annotation("DEP") else []
    object_indices = collect_object_indices(doc, root) if doc.has_annotation("DEP") else []
    verb_indices = collect_verb_indices(root) if doc.has_annotation("DEP") else [root.i]

    used_indices = set(time_indices) | set(subject_indices) | set(object_indices) | set(verb_indices)
    remaining_indices = [
        token.i
        for token in doc
        if not token.is_space and not token.is_punct and token.i not in used_indices
    ]

    ordered_indices = ordered_unique(
        list(time_indices)
        + list(subject_indices)
        + list(object_indices)
        + list(remaining_indices)
        + list(verb_indices)
    )
    gloss_tokens = glossify_tokens(doc, ordered_indices)

    return ASLGlossResult(
        source_text=cleaned,
        normalized_text=" ".join(token.text for token in doc if not token.is_space),
        gloss_tokens=gloss_tokens,
    )


if __name__ == "__main__":
    examples = [
        "I am going to school tomorrow.",
        "What are you doing tonight?",
        "My name is Priya.",
    ]

    for example in examples:
        result = english_to_asl_gloss_data(example)
        print(f"EN: {result['source_text']}")
        print(f"ASL GLOSS: {result['gloss']}")
        print()