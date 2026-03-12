# Localization Guide - VitaPoint Inventory ERP

## Overview

The VitaPoint Inventory ERP system includes comprehensive multilingual support through a React Context-based localization system.

## Supported Languages

- **Spanish (es)** - Default language
- **English (en)**

## Architecture

### LanguageContext (`src/contexts/LanguageContext.tsx`)

The localization system is built on a React Context that provides:

- `language`: Current active language ('es' | 'en')
- `setLanguage()`: Function to switch languages
- `t()`: Translation function that returns localized strings

### Translation Object Structure

```typescript
const translations = {
  es: {
    // Spanish translations
    dashboard: 'Panel',
    products: 'Productos',
    // ... 200+ translation keys
  },
  en: {
    // English translations
    dashboard: 'Dashboard',
    products: 'Products',
    // ... 200+ translation keys
  }
};
```

## Usage in Components

### 1. Import the useLanguage hook

```typescript
import { useLanguage } from '../contexts/LanguageContext';
```

### 2. Use the translation function

```typescript
function MyComponent() {
  const { t } = useLanguage();

  return (
    <div>
      <h1>{t('dashboard')}</h1>
      <p>{t('welcomeTo')}</p>
    </div>
  );
}
```

### 3. Language Switching

The Layout component includes a language toggle button that switches between Spanish and English:

```typescript
const { language, setLanguage } = useLanguage();

const toggleLanguage = () => {
  setLanguage(language === 'es' ? 'en' : 'es');
};
```

## Components with Localization

All major components are fully localized:

- **Dashboard** - Overview statistics and system status
- **Products** - Product catalog management
- **Orders** - Order processing and tracking
- **Inventory** - Stock level monitoring
- **Reports** - Analytics and reporting
- **UserManagement** - User administration (Admin only)
- **ActivityLogs** - Activity tracking (Admin only)
- **AuditTrail** - Change audit logs (Admin only)
- **Layout** - Navigation and sidebar

## Translation Coverage

The system includes translations for:

- Navigation menu items
- Form labels and placeholders
- Button text
- Status indicators
- Error messages
- Success messages
- Table headers
- Filter options
- Confirmation dialogs
- Empty state messages
- Loading states

## Adding New Translations

To add a new translation key:

1. Open `src/contexts/LanguageContext.tsx`
2. Add the key to both `es` and `en` objects:

```typescript
const translations = {
  es: {
    // ... existing translations
    myNewKey: 'Mi nuevo texto en español',
  },
  en: {
    // ... existing translations
    myNewKey: 'My new text in English',
  }
};
```

3. Use it in your component:

```typescript
const { t } = useLanguage();
return <div>{t('myNewKey')}</div>;
```

## Adding New Languages

To add a new language (e.g., French):

1. Update the `Language` type in `LanguageContext.tsx`:

```typescript
type Language = 'es' | 'en' | 'fr';
```

2. Add the new language object to translations:

```typescript
const translations = {
  es: { /* ... */ },
  en: { /* ... */ },
  fr: {
    dashboard: 'Tableau de bord',
    products: 'Produits',
    // ... all other keys
  }
};
```

3. Update the default language if needed:

```typescript
const [language, setLanguage] = useState<Language>('es');
```

4. Update the language toggle UI in `Layout.tsx` to support the new language

## Best Practices

1. **Always use translation keys** - Never hardcode text in components
2. **Consistent naming** - Use camelCase for translation keys
3. **Meaningful keys** - Choose descriptive key names (e.g., `customerNameRequired` instead of `label1`)
4. **Complete coverage** - Ensure all languages have all keys
5. **Context in keys** - Include context when needed (e.g., `delivered2` for variations)
6. **Placeholders** - Include clear placeholders for input fields
7. **Error messages** - Provide helpful, localized error messages

## Mobile Responsiveness

All localized components maintain full mobile responsiveness:

- Sidebar navigation collapses on mobile with hamburger menu
- Language toggle adapts to available space
- Tables use horizontal scroll on small screens
- Forms stack vertically on mobile devices
- Buttons sized appropriately for touch interaction

## Current State

The system is production-ready with:

- **200+ translation keys** covering all UI elements
- **Full Spanish and English support**
- **Default language: Spanish**
- **Language toggle in header** (desktop) and mobile menu
- **All components using translation system**
- **No hardcoded text in codebase**
- **Fully mobile responsive**

## Testing Localization

To test the localization:

1. Start the application: `npm run dev`
2. Log in to the ERP system
3. Click the language toggle button (ES/EN) in the top navigation
4. Verify all text updates across all pages
5. Test on different screen sizes
6. Check forms, tables, and dialogs

## Performance

The localization system is optimized for performance:

- Translations loaded once at app initialization
- No external API calls for translations
- Minimal re-renders when switching languages
- Context provides efficient state management
- Translations bundled with application code

## Maintenance

To maintain translations:

1. **Regular audits** - Periodically review all translation keys for accuracy
2. **Consistency checks** - Ensure terminology is consistent across translations
3. **User feedback** - Collect feedback on translation quality
4. **Professional review** - Consider having native speakers review translations
5. **Documentation** - Keep this guide updated when adding new features

## Future Enhancements

Potential improvements for the localization system:

1. **Additional languages** - Portuguese, French, German, etc.
2. **Date/time localization** - Format dates according to locale
3. **Number formatting** - Currency and number formatting by locale
4. **RTL support** - Right-to-left languages (Arabic, Hebrew)
5. **Language persistence** - Save user language preference to database
6. **Dynamic loading** - Load translations on demand for better performance
7. **Translation management** - External translation management system

## Support

For questions or issues with localization:

- Review this documentation
- Check component implementation for examples
- Ensure LanguageProvider wraps the application in App.tsx
- Verify translation keys exist in both languages
- Test language switching functionality
