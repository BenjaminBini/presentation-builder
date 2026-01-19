// src/editor/fields/base.js
// Base field rendering logic and dispatcher

import { renderTextFields } from './text.js';
import {
    renderArrayField,
    renderColumnField,
    renderStatsField,
    renderStepsField,
    renderAgendaItemsField
} from './array.js';
import { renderRowsField, renderTableRowsField } from './table.js';
import { renderAnnotationsField } from './complex.js';

// Placeholders for better UX
export const FIELD_PLACEHOLDERS = {
    title: 'Entrez le titre...',
    subtitle: 'Sous-titre optionnel',
    author: 'Nom de l\'auteur',
    date: 'Ex: Janvier 2025',
    logo: 'https://example.com/logo.png',
    number: '01',
    tag: 'Ex: Feature, Important...',
    image: 'https://example.com/image.jpg',
    imageAlt: 'Description de l\'image',
    text: 'Votre texte ici...',
    quote: 'Entrez la citation...',
    authorName: 'Nom de l\'auteur',
    authorTitle: 'Fonction ou titre',
    authorImage: 'URL de la photo',
    filename: 'fichier.js',
    code: '// Votre code ici...',
    description: 'Description optionnelle',
    diagram: 'flowchart LR\n    A-->B'
};

// Main field renderer - dispatches to appropriate renderer based on field type
export function renderField(field, data) {
    const value = data[field.key];
    const placeholder = FIELD_PLACEHOLDERS[field.key] || '';
    const isFullWidth = ['textarea', 'array', 'stats', 'steps', 'annotations', 'rows', 'table-rows', 'column'].includes(field.type);
    const wrapperClass = isFullWidth ? 'form-group full-width' : 'form-group';

    switch (field.type) {
        case 'text':
        case 'number':
        case 'checkbox':
        case 'toggle':
        case 'textarea':
            return renderTextFields(field, value, placeholder, wrapperClass);

        case 'array':
            return renderArrayField(field, value || []);

        case 'column':
            return renderColumnField(field, value || { title: '', items: [] });

        case 'stats':
            return renderStatsField(field, value || []);

        case 'annotations':
            return renderAnnotationsField(field, value || []);

        case 'steps':
            return renderStepsField(field, value || []);

        case 'rows':
            return renderRowsField(field, value || []);

        case 'table-rows':
            return renderTableRowsField(field, value || []);

        case 'agenda-items':
            return renderAgendaItemsField(field, value || [], data.showDuration !== false);

        default:
            return '';
    }
}
