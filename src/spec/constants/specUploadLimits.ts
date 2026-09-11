import type { SpecFileType } from '../data/types';

/**
 * PRD §10.2 — Spec accepts PDF / DOC / DOCX only. Mirrors the BOM upload guard
 * (`src/bom/constants/uploadLimits.ts`) with the Spec allowlist.
 */
export const VALID_SPEC_UPLOAD_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const VALID_SPEC_UPLOAD_EXTENSIONS = ['.pdf', '.doc', '.docx'] as const;

export const SPEC_UPLOAD_ACCEPT_ATTRIBUTE = VALID_SPEC_UPLOAD_EXTENSIONS.join(',');

export const MAX_SPEC_UPLOAD_BYTES = 100 * 1024 * 1024;

export const SUPPORTED_FORMATS_HINT = 'Supported formats: PDF, DOC, DOCX. Up to 100 MB.';

export function formatSpecFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function specFileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot === -1 ? '' : fileName.slice(dot).toLowerCase();
}

export function specFileTypeFromName(fileName: string): SpecFileType | undefined {
  const ext = specFileExtension(fileName);
  if (ext === '.pdf') return 'pdf';
  if (ext === '.doc') return 'doc';
  if (ext === '.docx') return 'docx';
  return undefined;
}

export type SpecUploadRejection =
  | { kind: 'unsupported-type'; message: string }
  | { kind: 'empty-file'; message: string }
  | { kind: 'too-large'; message: string };

/**
 * Validates a picked file. Returns `undefined` when the file is acceptable.
 * Extension is authoritative because browsers report inconsistent MIME types for `.doc`.
 */
export function validateSpecUpload(file: File): SpecUploadRejection | undefined {
  const fileType = specFileTypeFromName(file.name);
  if (!fileType && !VALID_SPEC_UPLOAD_TYPES.has(file.type)) {
    return {
      kind: 'unsupported-type',
      message: `${file.name} is not a supported file. ${SUPPORTED_FORMATS_HINT}`,
    };
  }
  if (file.size === 0) {
    return {
      kind: 'empty-file',
      message: `${file.name} is empty (0 bytes). Choose a file that contains the specification.`,
    };
  }
  if (file.size > MAX_SPEC_UPLOAD_BYTES) {
    return {
      kind: 'too-large',
      message: `${file.name} is ${formatSpecFileSize(file.size)}. ${SUPPORTED_FORMATS_HINT}`,
    };
  }
  return undefined;
}
