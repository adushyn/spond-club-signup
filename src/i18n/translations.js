export const translations = {
  en: {
    // Header
    siteTitle: 'Spond Club',

    // Step indicator
    stepMemberType:  'Member type',
    stepYourInfo:    'Your info',
    stepReview:      'Review',

    // Step 1
    chooseMembership:     'Choose your membership',
    chooseMembershipDesc: 'Select the membership type that best fits you.',
    next:                 'Next →',

    // Step 2
    personalInfo:         'Personal information',
    personalInfoDesc:     'Please fill in your details below.',
    firstName:            'First name',
    lastName:             'Last name',
    email:                'Email address',
    phone:                'Phone number',
    phoneHint:            'Select your country code, then enter your local number.',
    dateOfBirth:          'Date of birth',
    dateOfBirthHint:      'e.g. 1990-06-15',
    back:                 '← Back',

    // Validation
    firstNameRequired:  'First name is required',
    firstNameTooLong:   'First name is too long',
    lastNameRequired:   'Last name is required',
    lastNameTooLong:    'Last name is too long',
    emailInvalid:       'Enter a valid email address',
    phoneInvalid:       'Enter a valid phone number (include country code)',
    birthDateRequired:  'Date of birth is required',
    birthDateInvalid:   'Invalid date',
    birthDateFuture:    'Date of birth must be in the past',
    birthDateTooYoung:  'You must be at least 18 years old to register',
    birthDateTooOld:    'Date of birth is unrealistically old',

    // Step 3
    reviewDetails:      'Review your details',
    reviewDetailsDesc:  'Please check everything is correct before submitting.',
    membership:         'Membership',
    form:               'Form',
    memberType:         'Member type',
    personalInfoLabel:  'Personal information',
    submitting:         'Submitting…',
    submitRegistration: 'Submit registration',
    submissionFailed:   'Submission failed',

    // Banners
    registrationOpens:      'Registration opens',
    registrationOpensDesc:  (date) => `Registration for this form opens on ${date}.`,
    successTitle:           (name) => `Welcome, ${name}!`,
    successBody:            'Your membership application has been received. We\'ll be in touch soon.',
    failedToLoad:           'Failed to load form',
    errorOccurred:          'An unexpected error occurred. Please try again.',
    networkError:           'Network error. Please check your connection and try again.',
    networkErrorHint:       'Could not reach the server. It may be starting up — please try again in a moment.',
    retry:                  'Try again',
    emailAlreadyHint:       'Go back and use a different email address.',

    // 404
    pageNotFound:     'Page not found',
    pageNotFoundDesc: "The page you're looking for doesn't exist.",
    goHome:           '← Register new member',

    // Success
    registerAnother:  '← Register another person',
    manageRegistration: 'Manage registration →',

    // Manage page
    manageTitle:         'Your profile',
    manageDesc:          'View or edit your membership details.',
    editRegistration:    'Edit',
    editTitle:           'Edit your profile',
    editMemberTypeDesc:  'Update your membership type if needed.',
    saveChanges:         'Save changes',
    saving:              'Saving…',
    deleteRegistration:  'Delete registration',
    deleting:            'Deleting…',
    confirmDeleteTitle:  'Delete registration?',
    confirmDeleteBody:   'This will permanently remove your membership application. This cannot be undone.',
    confirmDeleteBtn:    'Yes, delete',
    cancelBtn:           'Cancel',
    registrationDeleted: 'Your registration has been deleted.',
    changesSaved:        'Changes saved!',
    notFound:            'Registration not found.',

    // Language selector
    language: 'Language',
  },

  no: {
    // Header
    siteTitle: 'Spond Klubb',

    // Step indicator
    stepMemberType:  'Medlemstype',
    stepYourInfo:    'Din info',
    stepReview:      'Gjennomgang',

    // Step 1
    chooseMembership:     'Velg ditt medlemskap',
    chooseMembershipDesc: 'Velg den medlemstypen som passer best for deg.',
    next:                 'Neste →',

    // Step 2
    personalInfo:         'Personlig informasjon',
    personalInfoDesc:     'Fyll inn opplysningene dine nedenfor.',
    firstName:            'Fornavn',
    lastName:             'Etternavn',
    email:                'E-postadresse',
    phone:                'Telefonnummer',
    phoneHint:            'Velg landskode, skriv deretter inn lokalt nummer.',
    dateOfBirth:          'Fødselsdato',
    dateOfBirthHint:      'f.eks. 1990-06-15',
    back:                 '← Tilbake',

    // Validation
    firstNameRequired:  'Fornavn er påkrevd',
    firstNameTooLong:   'Fornavnet er for langt',
    lastNameRequired:   'Etternavn er påkrevd',
    lastNameTooLong:    'Etternavnet er for langt',
    emailInvalid:       'Skriv inn en gyldig e-postadresse',
    phoneInvalid:       'Skriv inn et gyldig telefonnummer (inkluder landskode)',
    birthDateRequired:  'Fødselsdato er påkrevd',
    birthDateInvalid:   'Ugyldig dato',
    birthDateFuture:    'Fødselsdato må være i fortiden',
    birthDateTooYoung:  'Du må være minst 18 år for å registrere deg',
    birthDateTooOld:    'Fødselsdato er urealistisk gammel',

    // Step 3
    reviewDetails:      'Gjennomgå opplysningene dine',
    reviewDetailsDesc:  'Sjekk at alt er riktig før du sender inn.',
    membership:         'Medlemskap',
    form:               'Skjema',
    memberType:         'Medlemstype',
    personalInfoLabel:  'Personlig informasjon',
    submitting:         'Sender inn…',
    submitRegistration: 'Send inn registrering',
    submissionFailed:   'Innsending mislyktes',

    // Banners
    registrationOpens:      'Registrering åpner',
    registrationOpensDesc:  (date) => `Registrering for dette skjemaet åpner ${date}.`,
    successTitle:           (name) => `Velkommen, ${name}!`,
    successBody:            'Din medlemssøknad er mottatt. Vi tar kontakt snart.',
    failedToLoad:           'Kunne ikke laste inn skjema',
    errorOccurred:          'En uventet feil oppstod. Vennligst prøv igjen.',
    networkError:           'Nettverksfeil. Sjekk tilkoblingen din og prøv igjen.',
    networkErrorHint:       'Kunne ikke nå serveren. Den starter kanskje opp — prøv igjen om et øyeblikk.',
    retry:                  'Prøv igjen',
    emailAlreadyHint:       'Gå tilbake og bruk en annen e-postadresse.',

    // 404
    pageNotFound:     'Side ikke funnet',
    pageNotFoundDesc: 'Siden du leter etter finnes ikke.',
    goHome:           '← Registrer nytt medlem',

    // Success
    registerAnother:  '← Registrer en annen person',
    manageRegistration: 'Administrer registrering →',

    // Manage page
    manageTitle:         'Din profil',
    manageDesc:          'Se eller rediger dine medlemsdetaljer.',
    editRegistration:    'Rediger',
    editTitle:           'Rediger profilen din',
    editMemberTypeDesc:  'Oppdater medlemstypen din om nødvendig.',
    saveChanges:         'Lagre endringer',
    saving:              'Lagrer…',
    deleteRegistration:  'Slett registrering',
    deleting:            'Sletter…',
    confirmDeleteTitle:  'Slette registrering?',
    confirmDeleteBody:   'Dette vil permanent fjerne søknaden din. Dette kan ikke angres.',
    confirmDeleteBtn:    'Ja, slett',
    cancelBtn:           'Avbryt',
    registrationDeleted: 'Registreringen din er slettet.',
    changesSaved:        'Endringer lagret!',
    notFound:            'Registrering ikke funnet.',

    // Language selector
    language: 'Språk',
  },
}

/** Detect language from browser, fall back to English.
 *  Maps Norwegian Bokmål (nb) and Nynorsk (nn) → 'no'. */
export function detectLanguage() {
  const lang = navigator.language || navigator.languages?.[0] || 'en'
  const code = lang.toLowerCase().split('-')[0]
  // nb (Bokmål) and nn (Nynorsk) both map to our 'no' locale
  const normalized = { nb: 'no', nn: 'no' }[code] ?? code
  return translations[normalized] ? normalized : 'en'
}

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'no', label: 'Norsk',   flag: '🇳🇴' },
]
