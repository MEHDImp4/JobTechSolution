"""
Custom exceptions for the IA pipeline — Phase 4 Plan 1.
"""


class CVExtractionError(Exception):
    """Raised when CV text extraction fails (empty PDF, read error, etc.)."""

    pass


class CVUnsupportedFormatError(CVExtractionError):
    """Raised when the CV file format is not supported (not PDF or DOCX)."""

    pass
