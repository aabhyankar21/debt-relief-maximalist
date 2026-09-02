/**
 * Orbit — Steps 1–8 tuning surface.
 * Copy, collage layout, and accent colours live here so screens
 * can be tuned without touching layout or animation code.
 *
 * Step 1 desktop: globe + US map + isometric portrait tiles
 * Step 1 mobile:  Figma 390 (node 192:13248) short globe stage + sheet
 * Step 2 desktop: Figma 1440×900 (node 159:11776)
 * Step 2 mobile:  Figma 390 (node 192:13349)
 * Step 3 desktop: Figma 1440×900 (node 159:11858)
 * Step 3 mobile:  Figma 390 (node 192:13517)
 * Step 4 desktop: Figma 1440×900 (node 201:13851)
 * Step 4 mobile:  Figma 390 (node 197:13685)
 * Step 5 desktop: Figma 1440×900 (node 201:14012) number-vault orbit
 * Step 5 mobile:  Figma 390 (node 201:14093) compact vault strip
 * Step 6 desktop: affordability dial on rings (income trust card)
 * Step 6 mobile:  landscape dial card in the short stage window
 * Step 7 desktop: results radar — USA map + sweep scanning city dots
 * Step 7 mobile:  same short-stage + sheet treatment as steps 3–6
 * Step 8 desktop: Figma 1440×900 (node 220:15016) centered match card
 * Step 8 mobile:  adaptive stack of the same match card + rings
 * Desktop positions are relative to the 560×560 ring stage.
 */

import photoGraduates from './assets/photo-graduates.jpg';
import photoHospital from './assets/photo-hospital.jpg';
import photoLoan from './assets/photo-loan.jpg';
import photoCredit from './assets/photo-credit.jpg';
import photoJohn from './assets/photo-john.png';
import photoMarcus from './assets/photo-marcus.png';
import photoAisha from './assets/photo-aisha.png';
import photoBirthday from './assets/photo-birthday.png';
import avatarGraduates from './assets/avatar-graduates.jpg';
import avatarCredit from './assets/avatar-credit.jpg';
import avatarLaptop from './assets/avatar-laptop.jpg';
import avatarPhone from './assets/avatar-phone.jpg';
import avatarBlue from './assets/avatar-blue.jpg';
import avatarHandshake from './assets/avatar-handshake.jpg';
import avatarGlasses from './assets/avatar-glasses.jpg';
import avatarOffice from './assets/avatar-office.jpg';
import avatarDenim from './assets/avatar-denim.jpg';
import avatarThink from './assets/avatar-think.jpg';
import iconPersonalLoan from './assets/icon-personal-loan.png';
import iconCreditCards from './assets/icon-credit-cards.png';
import iconMedical from './assets/icon-medical.png';
import iconStudent from './assets/icon-student.png';
import logoCardJgWentworth from './assets/logo-card-jg-wentworth.png';
import logoCardNational from './assets/logo-card-national.png';
import logoCardAmericor from './assets/logo-card-americor.png';
import logoCardAccredited from './assets/logo-card-accredited.png';
import logoCardFreedom from './assets/logo-card-freedom.png';
import usaMap from './assets/usa-map.svg';

export const ORBIT_CONFIG = {
  colors: {
    bg: '#ffffff',
    text: '#000000',
    muted: '#000000',
    caption: '#515260',
    accent: '#0033ff',
    accentDeep: '#35416e',
    cardInk: '#201e1c',
    cardCream: '#f6ead6',
    cardCreamText: '#000000',
    cardInkText: '#f6ead6',
    /**
     * Step 2 story panel fallback (per-slide pastels live on
     * STORY_SPOTLIGHT.slides[].panelColor).
     */
    storyMint: '#e5f2ea',
    choiceBorder: '#d7dce5',
    choiceText: '#1f2937',
    trustBg: '#fffbf6',
    headerBorder: '#efefef',
    legal: '#7f8b9a',
  },

  copy: {
    /** Desktop — Figma 159:11695 */
    headingBefore: 'How much ',
    headingAccent: 'debt are you carrying',
    headingAfter: ' right now?',
    /** Mobile — Figma 192:13248 */
    mobileHeadingBefore: 'Roughly, ',
    mobileHeadingAccent: 'how much debt',
    mobileHeadingAfter: ' is weighing on you?',
    subtext:
      "An estimate works fine here - we just want to understand where you're starting from, so we can point you toward the right partner.",
    cta: 'Check If You Qualify',
    trustItems: [
      'Pay Up To 45% Less Than You Owe',
      'Debt Free In As Little As 24-48 Months*',
    ],
    /** Desktop rating eyebrow on steps 1–3 (replaces score/label). */
    ratingPartners: 'Top-rated partners',
    ratingScore: '4.7',
    ratingLabel: ' – 44,500+ Reviews',
  },

  step2: {
    headingBefore: 'What kind of ',
    headingAccent: 'debt do you have',
    headingAfter: '?',
    subtext:
      "We'll use this to find debt relief options that fit your situation.",
    trustItems: [
      'Pay Up To 45% Less Than You Owe',
      'Debt Free In As Little As 24-48 Months*',
    ],
    ratingScore: '4.7',
    ratingLabel: ' – 44,500+ Reviews',
  },

  step3: {
    headingBefore: 'Who should we ',
    headingAccent: 'send this to',
    headingAfter: '?',
    subtext:
      'Enter your name and email so we can deliver your results and follow up if anything changes.',
    fields: [
      {
        id: 'firstName',
        label: 'First Name',
        placeholder: 'Enter First Name',
        type: 'text' as const,
        required: true,
        autoComplete: 'given-name',
      },
      {
        id: 'lastName',
        label: 'Last Name',
        placeholder: 'Enter Last Name',
        type: 'text' as const,
        required: true,
        autoComplete: 'family-name',
      },
      {
        id: 'email',
        label: 'Email Address',
        placeholder: 'Enter Email',
        type: 'email' as const,
        required: true,
        autoComplete: 'email',
      },
    ],
    secureNote: 'Secured by Forbes.com',
    tipBefore: 'Required to match you with the ',
    tipEmph1: 'right offer',
    tipMid: ". We'll only send what matters ",
    tipEmph2: '- no spam.',
    cta: 'Continue',
    trustItems: [
      'Pay Up To 45% Less Than You Owe',
      'Debt Free In As Little As 24-48 Months*',
    ],
    ratingScore: '4.7',
    ratingLabel: ' – 44,500+ Reviews',
  },

  step4: {
    headingBefore: "When's ",
    headingAccent: 'your birthday?',
    /** Mobile Figma keeps the ? outside the gradient span. */
    mobileHeadingAccent: 'your birthday',
    mobileHeadingAfter: '?',
    subtext:
      "This helps us match you with offers you actually qualify for. It won't affect your credit score.",
    monthPlaceholder: 'Month',
    dayPlaceholder: 'Date',
    yearPlaceholder: 'Year',
    secureNote:
      'Your information is secure and will never be shared without your permission.',
    cta: 'Continue',
    trustItems: [
      'Pay Up To 45% Less Than You Owe',
      'Debt Free In As Little As 24-48 Months*',
    ],
  },

  step5: {
    headingBefore: "What's your ",
    headingAccent: 'phone number',
    headingAfter: '?',
    /** Desktop — Figma 201:14012 */
    subtext: "This confirms it's really you. One text, one code, you're in.",
    /** Mobile — Figma 201:14093 */
    mobileSubtext:
      "This lets us verify you're really you and send your personalized results. One text, one code, done.",
    field: {
      id: 'phone',
      label: 'Phone Number',
      placeholder: 'Enter US mobile number',
      type: 'tel' as const,
      required: true,
      autoComplete: 'tel-national',
    },
    secureNote: 'Secured by Forbes.com',
    tip: "Your number stays private - we'll never share it without asking you first.",
    cta: 'Continue',
    trustItems: [
      'Pay Up To 45% Less Than You Owe',
      'Debt Free In As Little As 24-48 Months*',
    ],
    consent: {
      before: 'By clicking "Continue", I agree to the ',
      spinwheel: 'Spinwheel End User Agreement',
      mid: '. Further, 1 am providing "written instructions" to Spinwheel Solutions, Inc. authorizing it to obtain your credit profile from any consumer reporting agency. I provide my electronic signature and agree to receive marketing texts, calls, and emails using automated technology and/or artificial or prerecorded voice messages, even if my telephone number is currently listed on a federal, state, internal, or corporate Do-Not-Call list, from Forbes.com and Partners, and parties calling on their behalf. I understand that my consent is not required as a condition of purchase. I also agree to your ',
      privacy: 'Privacy Statement',
      and: ' and ',
      terms: 'Terms and Conditions.',
    },
  },

  step6: {
    /** Desktop — Figma 204:14279 */
    headingBefore: 'What is your ',
    headingAccent: 'estimated annual income?',
    trustItems: [
      'Pay Up To 45% Less Than You Owe',
      'Debt Free In As Little As 24-48 Months*',
    ],
  },

  step7: {
    /** Desktop — Figma 220:14833 */
    headingBefore: 'Find the ',
    headingAccent: 'best options ',
    headingAfter: 'available to you',
    subtext:
      'Programs and eligibility vary by state - your address just helps us match you accurately. No mail is ever sent here.',
    fields: [
      {
        id: 'address1',
        label: 'Address Line 1',
        placeholder: 'Address line 1',
        type: 'text' as const,
        required: true,
        autoComplete: 'address-line1',
      },
      {
        id: 'address2',
        label: 'Address Line 2',
        placeholder: 'Address line 2',
        type: 'text' as const,
        required: false,
        autoComplete: 'address-line2',
      },
      {
        id: 'zip',
        label: 'Zip Code',
        placeholder: 'Zip Code',
        type: 'zip' as const,
        required: true,
        autoComplete: 'postal-code',
      },
    ],
    secureNote: 'Secured by Forbes.com',
    cta: 'Show My Results',
    trustItems: [
      'Pay Up To 45% Less Than You Owe',
      'Debt Free In As Little As 24-48 Months*',
    ],
  },

  step8: {
    /** Desktop — Figma 220:15016 */
    eyebrow: 'Congratulations!',
    /** `{name}` is replaced with the contact first name when present. */
    eyebrowNamed: 'Congratulations, {name}!',
    heading: 'We matched you with a personalized Debt Relief partner',
    kicker:
      'You did the hard part. A specialist is ready for the next step.',
    note: "You're closer to being debt-free than you were this morning.",
    badge: 'Our Pick For You',
    partnerName: 'National Debt Relief',
    status:
      "You're almost there — a representative will call shortly to help finish the process.",
    bullets: [
      'A+ BBB rating and AFCC accredited',
      'Free consultation and personalized savings estimate',
      'Combine high-interest debts into one low monthly payment',
    ],
    cta: 'Call Now',
  },
} as const;

/** Insight-deck motion tuning — entrance, float, hover, rings. */
export const ORBIT_MOTION = {
  /** Full revolution of the dashed rings, seconds. */
  ringSpinSec: 70,
  /** Stagger between card entrances, seconds. */
  enterStaggerSec: 0.06,
  /** Card entrance duration, seconds. */
  enterDurSec: 0.42,
  /** Hover scale multiplier (holographic tile expand). */
  hoverScale: 1.95,
  /** How far hover pulls a card toward stage center (0–1). */
  hoverPull: 0.42,
  /** Hover spring — higher stiffness = snappier. */
  hoverSpring: { stiffness: 520, damping: 28, mass: 0.55 },
  /** Per-card float amplitudes in px. */
  floatAmps: [5, 7, 4, 6] as const,
  /** Per-card float loop durations in seconds. */
  floatDurations: [9, 10.5, 8.5, 11] as const,
} as const;

/**
 * Step 1 radar scan — same pin/sweep language as ResultsSpotlight (step 7).
 * Pin lights each avatar as it passes; images and layout stay as placed.
 */
export const ORBIT_SCAN = {
  /** Full revolution of the scanning pin, seconds. */
  scanSec: 5.5,
  /** Distance of the pin from stage center (% of stage). */
  pinRadius: 40,
  /** Peak scale when the pin is on an avatar. */
  litScale: 1.22,
  /** Half-width of the lit window in degrees (pin “on” the avatar). */
  litHalfAngle: 16,
} as const;

export const DEBT_AMOUNT_OPTIONS = [
  { id: '16-20', label: '$16K - $20K' },
  { id: '21-25', label: '$21K - $25K' },
  { id: '26-30', label: '$26K - $30K' },
  { id: '31-35', label: '$31K - $35K' },
  { id: '35-plus', label: '$35K+' },
] as const;

export type DebtBandId = (typeof DEBT_AMOUNT_OPTIONS)[number]['id'];

/** Figma labels mapped to frozen journey choice ids (income step). */
export const INCOME_OPTIONS = [
  { id: 'lt-10k', label: 'Less than $10,000' },
  { id: '10-50k', label: '$10,000 - $50,000' },
  { id: '50-100k', label: '$50,000 - $100,000' },
  { id: '100k-plus', label: '$100,000+' },
  { id: 'unsure', label: 'Unsure' },
] as const;

export type IncomeBandId = (typeof INCOME_OPTIONS)[number]['id'];

/** Figma labels mapped to frozen journey choice ids. */
export const DEBT_TYPE_OPTIONS = [
  {
    id: 'personal-loans',
    label: 'Personal Loan',
    icon: iconPersonalLoan,
  },
  {
    id: 'credit-card',
    label: 'Credit Cards',
    icon: iconCreditCards,
  },
  {
    id: 'medical',
    label: 'Medical',
    icon: iconMedical,
  },
  {
    id: 'student',
    label: 'Student',
    icon: iconStudent,
  },
] as const;

export type DebtTypeId = (typeof DEBT_TYPE_OPTIONS)[number]['id'];

/**
 * Step 5 number vault —
 * Desktop: dashed rings + dim partner cards + cream vault card (Figma 201:14012).
 * Mobile: landscape vault card in the 390×150 stage window (Figma 201:14093).
 * Desktop positions are % of the 560×560 ring stage at (126,128).
 */
export const PHONE_VAULT = {
  pill: 'Encrypted',
  title: 'Your number stays with us',
  chips: ['One text', 'Never sold', 'Private'] as const,
  /**
   * Cream vault card — centered on the ring stage.
   * Width only; left/top centering lives in CSS.
   */
  card: { w: 62.5 },
  /** Partner cards recede; they are reviewed companies, not recipients. */
  cards: [
    {
      id: 'jg-wentworth',
      image: logoCardJgWentworth,
      alt: 'JG Wentworth',
      x: 6.96,
      y: 15,
      w: 32.14,
      h: 13.57,
    },
    {
      id: 'national',
      image: logoCardNational,
      alt: 'National Debt Relief',
      x: 61.96,
      y: 13.75,
      w: 32.14,
      h: 13.57,
    },
    {
      id: 'americor',
      image: logoCardAmericor,
      alt: 'Americor',
      x: -3.57,
      y: 55.54,
      w: 32.14,
      h: 13.57,
    },
    {
      id: 'accredited',
      image: logoCardAccredited,
      alt: 'Accredited Debt Relief',
      x: 74.64,
      y: 63.93,
      w: 32.14,
      h: 13.57,
    },
    {
      id: 'freedom',
      image: logoCardFreedom,
      alt: 'Freedom Debt Relief',
      x: 31.96,
      y: 81.07,
      w: 32.14,
      h: 13.57,
    },
  ],
} as const;

/**
 * Step 7 results-ready collage —
 * Desktop: dashed rings + USA map + radar sweep scanning city dots.
 * Mobile: compact radar orb + copy in the 390×150 stage window
 * (same short-stage treatment as steps 3–6).
 * City x/y are % of the map box.
 */
export const RESULTS_SPOTLIGHT = {
  title: 'Your results are ready',
  body: "We've matched you with relief options based on what you shared. One last step to see them.",
  readyLabel: 'Matching',
  /** Full revolution of the radar sweep, seconds. */
  scanSec: 5.5,
  map: usaMap,
  /**
   * Map box on the 560 stage — wide contiguous USA silhouette.
   * Cities are % of this box (not the full stage).
   */
  mapBox: { x: 6, y: 24, w: 88, h: 48 },
  /**
   * City dots on the map. The sweep lights each as it passes.
   * Spread covers coasts + heartland so the scan feels national.
   * Coords tuned to the cropped contiguous Albers silhouette.
   */
  cities: [
    // Pacific Northwest
    { id: 'seattle', x: 12, y: 16 },
    { id: 'portland', x: 10, y: 26 },
    // California + Southwest
    { id: 'sf', x: 6, y: 48 },
    { id: 'la', x: 9, y: 64 },
    { id: 'sandiego', x: 11, y: 74 },
    { id: 'vegas', x: 16, y: 56 },
    { id: 'phoenix', x: 18, y: 68 },
    { id: 'albuquerque', x: 30, y: 62 },
    // Mountain / Plains
    { id: 'saltlake', x: 24, y: 40 },
    { id: 'denver', x: 34, y: 46 },
    { id: 'billings', x: 32, y: 22 },
    { id: 'omaha', x: 50, y: 40 },
    { id: 'kansascity', x: 54, y: 50 },
    { id: 'okc', x: 48, y: 64 },
    // Texas + South
    { id: 'dallas', x: 48, y: 70 },
    { id: 'austin', x: 46, y: 78 },
    { id: 'houston', x: 52, y: 82 },
    { id: 'neworleans', x: 62, y: 84 },
    { id: 'memphis', x: 64, y: 64 },
    // Midwest / Great Lakes
    { id: 'minneapolis', x: 55, y: 26 },
    { id: 'milwaukee', x: 64, y: 32 },
    { id: 'chicago', x: 66, y: 40 },
    { id: 'detroit', x: 72, y: 36 },
    { id: 'indianapolis', x: 70, y: 48 },
    { id: 'stlouis', x: 62, y: 52 },
    { id: 'cleveland', x: 76, y: 38 },
    // Southeast
    { id: 'nashville', x: 70, y: 60 },
    { id: 'atlanta', x: 74, y: 66 },
    { id: 'charlotte', x: 80, y: 62 },
    { id: 'tampa', x: 78, y: 84 },
    { id: 'miami', x: 82, y: 90 },
    // Northeast Mid-Atlantic
    { id: 'pittsburgh', x: 80, y: 42 },
    { id: 'dc', x: 86, y: 48 },
    { id: 'philadelphia', x: 88, y: 42 },
    { id: 'nyc', x: 89, y: 34 },
    { id: 'buffalo', x: 84, y: 30 },
    { id: 'boston', x: 94, y: 28 },
  ],
  /**
   * Mobile — compact radar + copy in the 390×150 stage window.
   */
  mobile: {
    body: 'Matched to what you shared. One last step to see them.',
    /** Subset so the compact orb stays readable. */
    cityIds: [
      'seattle',
      'la',
      'phoenix',
      'denver',
      'dallas',
      'chicago',
      'atlanta',
      'miami',
      'nyc',
      'boston',
    ] as const,
  },
} as const;

/**
 * Step 6 income affordability dial —
 * Desktop: dashed rings + cream trust card with blue meter face.
 * Mobile: landscape dial card in the 390×150 stage window.
 * Distinct from the phone vault (arc gauge, not digit seals) but same
 * Orbit language: cream card, green pill, soft chips, ring stage.
 * Card width is % of the 560×560 ring stage; centering lives in CSS.
 */
export const INCOME_SPOTLIGHT = {
  pill: 'Estimate only',
  title: 'We only need a range',
  chips: ['No bank login', 'Range is enough', 'Private'] as const,
  note: 'Used to size your match — never sold or shared.',
  idleLabel: 'Pick a range',
  idleLevel: 0.2,
  card: { w: 64 },
  /** Dial fill + readout keyed to frozen income choice ids. */
  bands: {
    'lt-10k': { level: 0.3, label: 'Tight but possible' },
    '10-50k': { level: 0.5, label: 'Room to plan' },
    '50-100k': { level: 0.72, label: 'Comfortable fit' },
    '100k-plus': { level: 0.9, label: 'Strong match' },
    unsure: { level: 0.42, label: "We'll estimate" },
  },
} as const;

/**
 * Step 4 birthday collage —
 * Desktop: rings + portrait + holo glass insight + decade timeline.
 * Mobile: glass banner + arched portrait in the 390×150 stage.
 * Desktop positions are % of the 560×560 ring stage.
 */
export const BIRTHDAY_SPOTLIGHT = {
  photo: photoBirthday,
  calloutTitle: 'Did you know?',
  calloutBody:
    'People who start relief in their 30s and 40s save the most - years of compounding interest, stopped early.',
  /** Shorter body for the compact mobile glass banner. */
  mobileCalloutBody:
    'Start in your 30s and 40s to stop compounding interest early.',
  badgeLabel: 'Peak savings window',
  decades: [
    { id: '20s', label: '20s', peak: false },
    { id: '30s', label: '30s', peak: true },
    { id: '40s', label: '40s', peak: true },
    { id: '50s', label: '50s+', peak: false },
  ] as const,
  /**
   * Photo — cutout PNG; positions relative to the 560 ring stage.
   */
  photoBox: { x: 25.18, y: 2.68, w: 50, h: 64.64 },
  photoCrop: { x: -33.17, y: -5.9, w: 162.93, h: 119.99 },
  photoRadius: 0,
  /** Peak-window pill near the portrait shoulder. */
  badge: { x: 58, y: 10, w: 34 },
  /** Decade constellation above the glass callout. */
  timeline: { x: 18, y: 52, w: 64 },
  /** Glass insight card — height is content-driven in CSS. */
  callout: { x: 18, y: 61, w: 64 },
  /**
   * Mobile collage — glass banner + arched portrait.
   * Photo geometry is owned by CSS (cqw → 128×189 @ 390) so it
   * doesn’t stretch when the stage banner height changes.
   */
  mobile: {
    /** Full-bleed glass banner behind the portrait. */
    callout: { x: 0, y: 0, w: 100, h: 100 },
  },
} as const;

/**
 * Step 3 partner collage —
 * Desktop: phone mockup in the rings with a secure recap screen.
 * Mobile: inset device-screen card in the cream short-stage banner.
 * Desktop phoneBox is % of the 560×560 ring stage.
 */
export const PARTNER_SPOTLIGHT = {
  appName: 'Forbes Advisor',
  encryptedLabel: 'Encrypted',
  statusTime: '9:41',
  summaryHeading: "Here's what you've shared",
  amountLabel: 'Debt amount',
  typeLabel: 'Debt type',
  emptyValue: '—',
  savedLabel: 'answers saved',
  nextHint: 'Add your contact next',
  privacyNote:
    'Your information is secure and will never be shared without your permission.',
  /**
   * Phone chassis relative to the 560 ring stage.
   * Width drives size; height comes from a real-device aspect ratio in CSS
   * so the mockup can’t stretch or squat.
   */
  phoneBox: { x: 30.5, y: 9.5, w: 39 },
} as const;

/**
 * Step 2 story collage — pastel panel + portrait + cream outcome card.
 * Desktop positions are % of the 560×560 ring stage (Figma 159:11776).
 * Mobile positions are % of the 390×150 stage window under the header
 * (Figma 192:13349); mint/photo overhang slightly above the window.
 * Carousel rotates through outcome stories (photo + copy).
 * panelColor is a cool pastel pulled from each portrait’s clothing /
 * vibe — kept off warm cream (#f6ead6) so the join stays crisp.
 */
export const STORY_SPOTLIGHT = {
  /** Autoplay interval between stories (ms). */
  autoplayMs: 3500,
  slides: [
    {
      id: 'john',
      photo: photoJohn,
      eyebrow: 'John M. got out of debt',
      headline: '11 months sooner',
      detailBefore: 'than planned',
      detailAfter: '($55,000 paid off in 47 months)',
      /** Soft rose from burgundy sweater — cool enough vs cream card. */
      panelColor: '#f3e4ec',
      /**
       * Image crop inside photoBox — Figma absolute fill on 192:13498:
       * left -8.45%, top -2.59%, width 141.24%, height 102.59%.
       */
      photoCrop: { x: -8.45, y: -2.59, w: 141.24, h: 102.59 },
      /** Figma fill on 192:13483 — left -8.28%, top -2.55%, w 140.89%, h 102.64%. */
      mobilePhotoCrop: { x: -8.28, y: -2.55, w: 140.89, h: 102.64 },
      photoFit: 'fill' as const,
    },
    {
      id: 'marcus',
      photo: photoMarcus,
      eyebrow: 'Marcus R. got out of debt',
      headline: '9 months sooner',
      detailBefore: 'than planned',
      detailAfter: '($42,000 paid off in 36 months)',
      /** Soft sage from olive shirt. */
      panelColor: '#e5f2ea',
      photoCrop: { x: 0, y: -4, w: 100, h: 108 },
      mobilePhotoCrop: { x: 0, y: -2, w: 100, h: 108 },
      photoFit: 'cover' as const,
    },
    {
      id: 'aisha',
      photo: photoAisha,
      eyebrow: 'Aisha K. got out of debt',
      headline: '14 months sooner',
      detailBefore: 'than planned',
      detailAfter: '($38,000 paid off in 41 months)',
      /** Soft periwinkle — cool accent vs white tee + cream card. */
      panelColor: '#e7eaf7',
      photoCrop: { x: 0, y: -2, w: 100, h: 108 },
      mobilePhotoCrop: { x: 0, y: 0, w: 100, h: 108 },
      photoFit: 'cover' as const,
    },
  ],
  /**
   * Mint panel behind portrait — Figma 215:109 at (233,144) 358×284
   * relative to rings at (126,128).
   */
  mint: { x: 19.11, y: 2.86, w: 63.93, h: 50.71 },
  /** Portrait — Figma 192:13498 at (272,177) 279×256. */
  photoBox: { x: 26.07, y: 8.75, w: 49.82, h: 45.71 },
  /** Cream card attached under mint — Figma 192:13499 at (233,428). */
  card: { x: 19.11, y: 53.57, w: 63.93 },
  /** Carousel dots — vertically under the cream card (horizontally centered). */
  dots: { y: 80.18 },
  /**
   * Mobile side-by-side collage — Figma 390 frame (node 192:13349).
   * Coords % of the 390×150 stage window (frame y 48→198).
   */
  mobile: {
    /** Full-bleed mint strip — Figma 216:14495 at frame y=43, h=155. */
    mint: { x: 0, y: -3.33, w: 100, h: 103.33 },
    /** Portrait — Figma 192:13483 at (32,39) 174×159. */
    photoBox: { x: 8.21, y: -6, w: 44.62, h: 106 },
    /** Cream card — Figma 192:13484 at (206,72) 167×94. */
    card: { x: 52.82, y: 16, w: 42.82 },
    /** Dots centered near the bottom of the short stage. */
    dots: { y: 90 },
  },
} as const;

export interface OrbitGlobePerson {
  id: string;
  image: string;
  city: string;
  /** State pin on the map box (% of map). */
  pin: { x: number; y: number };
  /** Tile top-left as % of the ring stage. */
  x: number;
  y: number;
  /** Square edge as % of the ring stage. */
  size: number;
  /** Resting isometric pose (CSS rotateX / rotateY / rotateZ). */
  pitch: number;
  yaw: number;
  roll: number;
  /** Stacking order. */
  z: number;
  /**
   * Optional absolute-fill crop inside the square
   * (Figma left/top/width/height %).
   */
  crop?: { x: number; y: number; w: number; h: number };
}

/**
 * Step 1 globe + isometric portraits — % of the 560×560 ring stage.
 * Pins use the same Albers city coords as RESULTS_SPOTLIGHT (map-box %).
 * Tiles float around the globe; hover flattens them toward camera.
 */
export const ORBIT_GLOBE = {
  map: usaMap,
  /** Sphere centered on the 560 stage (x/y = (100 − w) / 2). */
  sphere: { x: 23, y: 23, w: 54 },
  /**
   * Contiguous USA on the globe face — % of the sphere box.
   * Modest isometric tilt is applied in CSS, not here.
   */
  mapBox: { x: 7, y: 27, w: 86, h: 48 },
  /** Extra city dots (no portrait) so the scan feels national. */
  dots: [
    { id: 'portland', x: 10, y: 26 },
    { id: 'sf', x: 6, y: 48 },
    { id: 'vegas', x: 16, y: 56 },
    { id: 'saltlake', x: 24, y: 40 },
    { id: 'albuquerque', x: 30, y: 62 },
    { id: 'omaha', x: 50, y: 40 },
    { id: 'okc', x: 48, y: 64 },
    { id: 'houston', x: 52, y: 82 },
    { id: 'minneapolis', x: 55, y: 26 },
    { id: 'detroit', x: 72, y: 36 },
    { id: 'nashville', x: 70, y: 60 },
    { id: 'tampa', x: 78, y: 84 },
    { id: 'dc', x: 86, y: 48 },
    { id: 'philadelphia', x: 88, y: 42 },
  ],
} as const;

/** Center copy on the globe face. */
export const ORBIT_STATS_CARD = {
  headline: 'Thousands Choosing Loan-Free Relief',
} as const;

export const ORBIT_GLOBE_PEOPLE: OrbitGlobePerson[] = [
  {
    id: 'laptop',
    image: avatarLaptop,
    city: 'Seattle',
    pin: { x: 12, y: 16 },
    x: 14.2,
    y: 23.2,
    size: 10.2,
    pitch: 12,
    yaw: -18,
    roll: -6,
    z: 5,
  },
  {
    id: 'denim',
    image: avatarDenim,
    city: 'Los Angeles',
    pin: { x: 9, y: 64 },
    x: 13.2,
    y: 44.3,
    size: 9.4,
    pitch: 10,
    yaw: -20,
    roll: 5,
    z: 4,
  },
  {
    id: 'blue',
    image: avatarBlue,
    city: 'Phoenix',
    pin: { x: 18, y: 68 },
    x: 15,
    y: 56.3,
    size: 9.8,
    pitch: 14,
    yaw: -12,
    roll: -3,
    z: 6,
    crop: { x: -48.66, y: -0.45, w: 149.98, h: 100 },
  },
  {
    id: 'think',
    image: avatarThink,
    city: 'Denver',
    pin: { x: 34, y: 46 },
    x: 29.4,
    y: 13.7,
    size: 8.8,
    pitch: 10,
    yaw: -8,
    roll: 6,
    z: 4,
  },
  {
    id: 'office',
    image: avatarOffice,
    city: 'Dallas',
    pin: { x: 48, y: 70 },
    x: 40.1,
    y: 67.1,
    size: 7.6,
    pitch: 12,
    yaw: 6,
    roll: -4,
    z: 5,
  },
  {
    id: 'handshake',
    image: avatarHandshake,
    city: 'Chicago',
    pin: { x: 66, y: 40 },
    x: 52.1,
    y: 13.1,
    size: 7.4,
    pitch: 8,
    yaw: 10,
    roll: 3,
    z: 5,
  },
  {
    id: 'glasses',
    image: avatarGlasses,
    city: 'Atlanta',
    pin: { x: 74, y: 66 },
    x: 62.6,
    y: 67.1,
    size: 7.4,
    pitch: 12,
    yaw: 14,
    roll: -5,
    z: 5,
  },
  {
    id: 'phone',
    image: avatarPhone,
    city: 'Miami',
    pin: { x: 82, y: 90 },
    x: 72.8,
    y: 54.8,
    size: 10,
    pitch: 12,
    yaw: 16,
    roll: 4,
    z: 6,
  },
  {
    id: 'credit',
    image: avatarCredit,
    city: 'New York',
    pin: { x: 89, y: 34 },
    x: 72.7,
    y: 27.7,
    size: 10.2,
    pitch: 8,
    yaw: 18,
    roll: -7,
    z: 5,
  },
  {
    id: 'graduates',
    image: avatarGraduates,
    city: 'Boston',
    pin: { x: 94, y: 28 },
    x: 71.2,
    y: 12.7,
    size: 10.6,
    pitch: 10,
    yaw: 16,
    roll: 5,
    z: 6,
  },
];

/**
 * Step 1 mobile globe strip — % of the 268×268 canvas in the 150px window.
 */
export const ORBIT_GLOBE_PEOPLE_MOBILE: OrbitGlobePerson[] = [
  {
    id: 'm-graduates',
    image: avatarGraduates,
    city: 'Boston',
    pin: { x: 94, y: 28 },
    x: 6,
    y: 22,
    size: 20,
    pitch: 16,
    yaw: -26,
    roll: -6,
    z: 4,
  },
  {
    id: 'm-phone',
    image: avatarPhone,
    city: 'Miami',
    pin: { x: 82, y: 90 },
    x: 41,
    y: 20,
    size: 16,
    pitch: 14,
    yaw: 12,
    roll: 6,
    z: 5,
  },
  {
    id: 'm-credit',
    image: avatarCredit,
    city: 'New York',
    pin: { x: 89, y: 34 },
    x: 72,
    y: 18,
    size: 18,
    pitch: 18,
    yaw: 30,
    roll: -8,
    z: 4,
  },
  {
    id: 'm-laptop',
    image: avatarLaptop,
    city: 'Seattle',
    pin: { x: 12, y: 16 },
    x: 18,
    y: 48,
    size: 18,
    pitch: 20,
    yaw: -22,
    roll: 4,
    z: 5,
  },
  {
    id: 'm-glasses',
    image: avatarGlasses,
    city: 'Atlanta',
    pin: { x: 74, y: 66 },
    x: 64,
    y: 48,
    size: 17,
    pitch: 16,
    yaw: 24,
    roll: -4,
    z: 6,
    crop: { x: -48.66, y: -0.45, w: 149.98, h: 100 },
  },
];

/** @deprecated Kept for unused marquee; step 1 now uses ORBIT_GLOBE_PEOPLE. */
export type InsightCardTone = 'ink' | 'cream';

export interface InsightCard {
  id: string;
  text: string;
  tone: InsightCardTone;
  image: string;
  rotate: number;
  x: number;
  y: number;
  z: number;
}

export const INSIGHT_CARDS: InsightCard[] = [
  {
    id: 'graduates',
    text: 'A lot of graduates are finding a lighter way forward.',
    tone: 'ink',
    image: photoGraduates,
    rotate: -12,
    x: -6.6,
    y: 24.7,
    z: 2,
  },
  {
    id: 'hospital',
    text: "A hospital bill shouldn't follow you around for years.",
    tone: 'cream',
    image: photoHospital,
    rotate: -3,
    x: 21.5,
    y: 4.3,
    z: 3,
  },
  {
    id: 'loan-2026',
    text: 'A lot of people are finally tackling their loan debt in 2026',
    tone: 'ink',
    image: photoLoan,
    rotate: 3,
    x: 41.5,
    y: 35.8,
    z: 4,
  },
  {
    id: 'credit-card',
    text: 'Plenty of people are working toward credit card freedom right now.',
    tone: 'cream',
    image: photoCredit,
    rotate: 12,
    x: 64.9,
    y: 17.6,
    z: 5,
  },
];
