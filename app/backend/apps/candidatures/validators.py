"""
File validators for CV uploads.
Validates file type using magic bytes (not just extension) and file size.
"""

from django.core.exceptions import ValidationError

# Magic bytes signatures for allowed file types
MAGIC_BYTES = {
    b'%PDF': 'application/pdf',
    b'PK\x03\x04': 'application/vnd.openxmlformats-officedocument',
}


def validate_cv_file(file):
    """
    Validate CV file by checking magic bytes (not extension) and file size.

    - Allowed formats: PDF, DOCX
    - Max size: 5 MB
    """
    file.seek(0)
    header = file.read(4)
    file.seek(0)

    if not any(header.startswith(magic) for magic in MAGIC_BYTES):
        raise ValidationError('Format invalide. Seuls PDF et DOCX acceptés.')

    if file.size > 5 * 1024 * 1024:
        raise ValidationError('Fichier trop grand. Maximum 5 Mo.')
