/**
 * Orbit — Steps 1–8 tuning surface.
 * Copy, collage layout, and accent colours live here so screens
 * can be tuned without touching layout or animation code.
 *
 * Step 1 desktop: Figma 1440×900 (node 159:11695) circular avatar orbit
 * Step 1 mobile:  Figma 390 (node 192:13248) short avatar stage + sheet
 * Step 2 desktop: Figma 1440×900 (node 159:11776)
 * Step 2 mobile:  Figma 390 (node 192:13349)
 * Step 3 desktop: Figma 1440×900 (node 159:11858)
 * Step 3 mobile:  Figma 390 (node 192:13517)
 * Step 4 desktop: Figma 1440×900 (node 201:13851)
 * Step 4 mobile:  Figma 390 (node 197:13685)
 * Step 5 desktop: Figma 1440×900 (node 201:14012) partner logo orbit
 * Step 5 mobile:  Figma 390 (node 201:14093)
 * Step 6 desktop: Figma 1440×900 (node 204:14279) income portrait orbit
 * Step 6 mobile:  same short-stage + sheet treatment as steps 3–5
 * Step 7 desktop: Figma 1440×900 (node 220:14833) results-ready card orbit
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
import photoPartner from './assets/photo-partner.png';
import photoBirthday from './assets/photo-birthday.png';
import photoIncome from './assets/photo-income.png';
import avatarGraduates from './assets/avatar-graduates.jpg';
import avatarCredit from './assets/avatar-credit.jpg';
import avatarLaptop from './assets/avatar-laptop.jpg';
import avatarPhone from './assets/avatar-phone.jpg';
import avatarBlue from './assets/avatar-blue.jpg';
import iconPersonalLoan from './assets/icon-personal-loan.png';
import iconCreditCards from './assets/icon-credit-cards.png';
import iconMedical from './assets/icon-medical.png';
import iconStudent from './assets/icon-student.png';
import logoCardJgWentworth from './assets/logo-card-jg-wentworth.png';
import logoCardNational from './assets/logo-card-national.png';
import logoCardAmericor from './assets/logo-card-americor.png';
import logoCardAccredited from './assets/logo-card-accredited.png';
import logoCardFreedom from './assets/logo-card-freedom.png';

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
    /** Step 2 story panel behind the portrait. */
    storyMint: '#e7fff9',
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
    heading:
      'We have matched you with your personalized Debt Relief partner',
    badge: 'Our Pick For You',
    partnerName: 'National Debt Relief',
    status:
      'You’re almost done! A representative will call shortly to help finish the process.',
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
  /** Hover scale multiplier. */
  hoverScale: 1.32,
  /** How far hover pulls a card toward stage center (0–1). */
  hoverPull: 0.42,
  /** Hover spring — higher stiffness = snappier. */
  hoverSpring: { stiffness: 520, damping: 28, mass: 0.55 },
  /** Per-card float amplitudes in px. */
  floatAmps: [5, 7, 4, 6] as const,
  /** Per-card float loop durations in seconds. */
  floatDurations: [9, 10.5, 8.5, 11] as const,
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
 * Step 5 partner-logo collage —
 * Desktop: dashed rings + 5 partner cards + center callout (Figma 201:14012).
 * Mobile: partner cards + callout in the 390×150 stage window (Figma 201:14093).
 * Desktop positions are % of the 560×560 ring stage at (126,128).
 * Mobile positions are % of the 390×150 stage window under the header.
 */
export const PARTNER_ORBIT = {
  callout:
    'We chose companies to review based on fees, services and customer satisfaction',
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
  /** Center callout — Figma 216:14525 at (291,340) 236 wide. */
  calloutBox: { x: 29.46, y: 37.86, w: 42.14 },
  /**
   * Mobile collage — Figma 201:14093.
   * Coords % of the 390×150 stage window (frame y 48→198).
   */
  mobile: {
    cards: [
      {
        id: 'jg-wentworth',
        image: logoCardJgWentworth,
        alt: 'JG Wentworth',
        x: 0.77,
        y: 5.33,
        w: 29.23,
        h: 32,
      },
      {
        id: 'national',
        image: logoCardNational,
        alt: 'National Debt Relief',
        x: 68.97,
        y: 5.33,
        w: 29.23,
        h: 32,
      },
      {
        id: 'americor',
        image: logoCardAmericor,
        alt: 'Americor',
        x: 68.72,
        y: 52.67,
        w: 29.23,
        h: 32,
      },
      {
        id: 'accredited',
        image: logoCardAccredited,
        alt: 'Accredited Debt Relief',
        x: 3.08,
        y: 58.67,
        w: 29.23,
        h: 32,
      },
      {
        id: 'freedom',
        image: logoCardFreedom,
        alt: 'Freedom Debt Relief',
        x: 35.38,
        y: 71.33,
        w: 29.23,
        h: 32,
      },
    ],
    /** Callout — Figma 216:14733 at top 65, w 160, centered. */
    calloutBox: { x: 29.49, y: 11.33, w: 41.03 },
  },
} as const;

/**
 * Step 7 results-ready collage —
 * Desktop: dashed rings + cream results card (Figma 220:14833).
 * Mobile: results card in the 390×150 stage window
 * (same short-stage treatment as steps 3–6).
 * Desktop positions are % of the 560×560 ring stage at (126,128).
 * Mobile positions are % of the 390×150 stage window under the header.
 */
export const RESULTS_SPOTLIGHT = {
  title: 'Your results are ready',
  body: "We've matched you with relief options based on what you shared. One last step to see them.",
  /**
   * Cream card — Figma 220:14929 at (227,210) 358×400
   * relative to rings at (126,128).
   */
  card: { x: 18.04, y: 14.64, w: 63.93, h: 71.43 },
  /** Dark scan panel — Figma 220:14943, 269 tall at bottom of 400. */
  scanPanel: { h: 67.25 },
  /**
   * Mobile — landscape card in the 390×150 stage window.
   * Horizontal cream copy + scan split (not a scaled desktop stack).
   */
  mobile: {
    body: 'Matched to what you shared. One last step to see them.',
  },
} as const;

/**
 * Step 6 income collage —
 * Desktop: dashed rings + arched portrait + insight card (Figma 204:14279).
 * Mobile: portrait + insight card in the 390×150 stage window
 * (same treatment as birthday/partner mobile stages).
 * Desktop positions are % of the 560×560 ring stage at (126,128).
 * Mobile positions are % of the 390×150 stage window under the header.
 */
export const INCOME_SPOTLIGHT = {
  photo: photoIncome,
  calloutTitle: 'Did you know?',
  calloutBody:
    'Most people approved for relief plans pay less per month than their current minimum payments combined.',
  /**
   * Photo — Figma 206:14427 at (183,156) 353×413 relative to rings (126,128).
   * Asset is the node export (already arched + cut out); fill the box 1:1.
   */
  photoBox: { x: 10.18, y: 5, w: 63.04, h: 73.75 },
  photoCrop: { x: 0, y: 0, w: 100, h: 100 },
  /** Bottom corner radius as % of photoBox width (1000 / 353). */
  photoRadius: 283.29,
  /**
   * Insight card — Figma 219:14830 at (394,208) 326×144
   * relative to rings at (126,128).
   */
  callout: { x: 47.86, y: 14.29, w: 58.21, h: 25.71 },
  /**
   * Mobile collage — same short-stage geometry as birthday (Figma 197:13685).
   * Photo left, callout overlapping right.
   */
  mobile: {
    photoBox: { x: 4.36, y: -9.33, w: 32.82, h: 126 },
    photoCrop: { x: 0, y: 0, w: 100, h: 100 },
    photoRadius: 250,
    callout: { x: 21.03, y: 9.33, w: 74.87, h: 79.33 },
  },
} as const;

/**
 * Step 4 birthday collage —
 * Desktop: dashed rings + arched portrait + insight card (Figma 201:13851).
 * Mobile: portrait + insight card in the 390×150 stage window (Figma 197:13685).
 * Desktop positions are % of the 560×560 ring stage at (126,128).
 * Mobile positions are % of the 390×150 stage window under the header.
 */
export const BIRTHDAY_SPOTLIGHT = {
  photo: photoBirthday,
  calloutTitle: 'Did you know?',
  calloutBody:
    'People who start relief in their 30s and 40s save the most - years of compounding interest, stopped early.',
  /**
   * Photo — Figma 206:14428 at (266,143) 280×413 relative to rings (126,128).
   * Asset is the node export (already arched + cropped); fill the box 1:1.
   */
  photoBox: { x: 25, y: 2.68, w: 50, h: 73.75 },
  photoCrop: { x: 0, y: 0, w: 100, h: 100 },
  /** Bottom corner radius as % of photoBox width (700 / 280). */
  photoRadius: 250,
  /**
   * Insight card — Figma 217:110 at (399,157) 326×144
   * relative to rings at (126,128).
   */
  callout: { x: 48.75, y: 5.18, w: 58.21, h: 25.71 },
  /**
   * Mobile collage — Figma 197:13685.
   * Photo 216:14723 at (17,34) 128×189; callout 216:14729 at (82,62) 292×119
   * relative to the 390×150 stage window (frame y 48→198).
   */
  mobile: {
    photoBox: { x: 4.36, y: -9.33, w: 32.82, h: 126 },
    photoCrop: { x: 0, y: 0, w: 100, h: 100 },
    /** Bottom corner radius as % of photoBox width (700 / 128). */
    photoRadius: 250,
    callout: { x: 21.03, y: 9.33, w: 74.87, h: 79.33 },
  },
} as const;

/**
 * Step 3 partner collage —
 * Desktop: arched portrait + summary card (Figma 159:11858).
 * Mobile: arched portrait + summary card (Figma 192:13517).
 * Desktop positions are % of the 560×560 ring stage.
 * Mobile positions are % of the 268×268 rings box.
 */
export const PARTNER_SPOTLIGHT = {
  photo: photoPartner,
  summaryHeading: "Here's what you have given so far:",
  amountLabel: 'Debt amount:',
  typeLabel: 'Debt type:',
  privacyNote:
    'Your information is secure and will never be shared without your permission.',
  /**
   * Photo box as % of stage (Figma 200:13825 → 390×463 in 560).
   * Image crop: absolute fill left -60.72%, top -7.92%, w 168.63%, h 107.92%.
   */
  photoBox: { x: 13.39, y: 4.11, w: 69.64, h: 82.68 },
  photoCrop: { x: -60.72, y: -7.92, w: 168.63, h: 107.92 },
  /** Bottom corner radius as % of photoBox width (200 / 390). */
  photoRadius: 51.28,
  /**
   * Summary card — Figma 201:13917 at (379,188) 326×144
   * relative to rings at (126,128).
   */
  summaryCard: { x: 45.18, y: 10.71, w: 58.21, h: 25.71 },
  /**
   * Mobile collage — Figma 192:13517.
   * Photo 201:13843 at (11,32) 182×215; summary 216:14709 at (81,59) 293×144
   * relative to rings Group 3 at (61,-12) 268×268.
   */
  mobile: {
    photoBox: { x: -18.66, y: 16.42, w: 67.91, h: 80.22 },
    photoCrop: { x: -60.72, y: -7.92, w: 168.63, h: 107.92 },
    /** Bottom corner radius as % of photoBox width (133.13 / 182). */
    photoRadius: 73.15,
    summaryCard: { x: 7.46, y: 26.49, w: 109.33, h: 53.73 },
  },
} as const;

/**
 * Step 2 story collage — mint panel + portrait + cream outcome card.
 * Desktop positions are % of the 560×560 ring stage (Figma 159:11776).
 * Mobile positions are % of the 390×150 stage window under the header
 * (Figma 192:13349); mint/photo overhang slightly above the window.
 */
export const STORY_SPOTLIGHT = {
  photo: photoJohn,
  eyebrow: 'John M. got out of debt',
  headline: '11 months sooner',
  detailBefore: 'than planned',
  detailAfter: '($55,000 paid off in 47 months)',
  /**
   * Mint panel behind portrait — Figma 215:109 at (233,144) 358×284
   * relative to rings at (126,128).
   */
  mint: { x: 19.11, y: 2.86, w: 63.93, h: 50.71 },
  /** Portrait — Figma 192:13498 at (272,177) 279×256. */
  photoBox: { x: 26.07, y: 8.75, w: 49.82, h: 45.71 },
  /**
   * Image crop inside photoBox — Figma absolute fill on 192:13498:
   * left -8.45%, top -2.59%, width 141.24%, height 102.59%.
   */
  photoCrop: { x: -8.45, y: -2.59, w: 141.24, h: 102.59 },
  /** Cream card attached under mint — Figma 192:13499 at (233,428). */
  card: { x: 19.11, y: 53.57, w: 63.93 },
  /** Carousel dots — Figma 216:14516 at (374,577) 64×10. */
  dots: { x: 44.29, y: 80.18, w: 11.43 },
  /**
   * Mobile side-by-side collage — Figma 390 frame (node 192:13349).
   * Coords % of the 390×150 stage window (frame y 48→198).
   */
  mobile: {
    /** Full-bleed mint strip — Figma 216:14495 at frame y=43, h=155. */
    mint: { x: 0, y: -3.33, w: 100, h: 103.33 },
    /** Portrait — Figma 192:13483 at (32,39) 174×159. */
    photoBox: { x: 8.21, y: -6, w: 44.62, h: 106 },
    /** Figma fill on 192:13483 — left -8.28%, top -2.55%, w 140.89%, h 102.64%. */
    photoCrop: { x: -8.28, y: -2.55, w: 140.89, h: 102.64 },
    /** Cream card — Figma 192:13484 at (206,72) 167×94. */
    card: { x: 52.82, y: 16, w: 42.82 },
  },
} as const;

export interface OrbitAvatar {
  id: string;
  image: string;
  /** Top-left as % of the ring stage. */
  x: number;
  y: number;
  /** Diameter as % of the ring stage. */
  size: number;
  /** CSS rotate in degrees. */
  rotate: number;
  /** Stacking order. */
  z: number;
  /**
   * Optional absolute-fill crop inside the circle
   * (Figma left/top/width/height %).
   */
  crop?: { x: number; y: number; w: number; h: number };
}

/**
 * Step 1 desktop circular collage — % of 560×560 rings (Figma 159:11695).
 * Coords from metadata bounding-box centers → unrotated circle top-left.
 */
export const ORBIT_AVATARS: OrbitAvatar[] = [
  {
    id: 'graduates',
    image: avatarGraduates,
    x: 8.22,
    y: 6.13,
    size: 21.43,
    rotate: -3,
    z: 3,
  },
  {
    id: 'credit',
    image: avatarCredit,
    x: 75.56,
    y: 3.6,
    size: 21.43,
    rotate: 12,
    z: 4,
  },
  {
    id: 'phone-sm-top',
    image: avatarPhone,
    x: 40.48,
    y: 10,
    size: 9.99,
    rotate: 8.91,
    z: 5,
  },
  {
    id: 'blue-sm-top',
    image: avatarBlue,
    x: 54.46,
    y: 19.46,
    size: 9.64,
    rotate: 0,
    z: 6,
    crop: { x: -48.66, y: -0.45, w: 149.98, h: 100 },
  },
  {
    id: 'phone-mid-left',
    image: avatarPhone,
    x: 5.83,
    y: 38.76,
    size: 16.65,
    rotate: -12,
    z: 4,
  },
  {
    id: 'laptop-mid-right',
    image: avatarLaptop,
    x: 81.35,
    y: 37.74,
    size: 17.35,
    rotate: 3,
    z: 4,
  },
  {
    id: 'laptop',
    image: avatarLaptop,
    x: 0.6,
    y: 63.23,
    size: 21.43,
    rotate: 3,
    z: 5,
  },
  {
    id: 'credit-sm',
    image: avatarCredit,
    x: 29.29,
    y: 68.97,
    size: 9.67,
    rotate: -4.45,
    z: 6,
  },
  {
    id: 'blue-sm-bot',
    image: avatarBlue,
    x: 52.32,
    y: 68.57,
    size: 9.64,
    rotate: 0,
    z: 6,
    crop: { x: -48.66, y: -0.45, w: 149.98, h: 100 },
  },
  {
    id: 'phone',
    image: avatarPhone,
    x: 71.1,
    y: 73.06,
    size: 21.43,
    rotate: -12,
    z: 5,
  },
  {
    id: 'blue',
    image: avatarBlue,
    x: 35.71,
    y: 81.07,
    size: 21.43,
    rotate: 0,
    z: 7,
    crop: { x: -48.66, y: -0.45, w: 149.98, h: 100 },
  },
];

/** Cream stats card — % of 560 stage (Figma 206:14446 → 260 wide at 277,319). */
export const ORBIT_STATS_CARD = {
  x: 26.96,
  y: 34.11,
  w: 46.43,
  headline: 'Thousands Are Applying Daily For This Loan-Free Relief In 2026',
  stats: [
    { value: '45%', label: 'DEBT REDUCTION' },
    { value: '48K+', label: 'REVIEWS' },
  ],
} as const;

/**
 * Step 1 mobile circular collage — % of 268×268 rings at (61, 6)
 * (Figma 192:13248). No cream card on mobile.
 */
export const ORBIT_AVATARS_MOBILE: OrbitAvatar[] = [
  {
    id: 'm-graduates',
    image: avatarGraduates,
    x: -28.34,
    y: 6.47,
    size: 44.78,
    rotate: -3,
    z: 3,
  },
  {
    id: 'm-phone-top',
    image: avatarPhone,
    x: 52.31,
    y: 13.12,
    size: 31.34,
    rotate: 8.91,
    z: 4,
  },
  {
    id: 'm-credit',
    image: avatarCredit,
    x: 94.44,
    y: 4.16,
    size: 44.78,
    rotate: 12,
    z: 3,
  },
  {
    id: 'm-laptop',
    image: avatarLaptop,
    x: 11.69,
    y: 38.08,
    size: 44.78,
    rotate: 3,
    z: 5,
  },
  {
    id: 'm-blue',
    image: avatarBlue,
    x: 73.88,
    y: 51.87,
    size: 33.58,
    rotate: 0,
    z: 6,
    crop: { x: -48.66, y: -0.45, w: 149.98, h: 100 },
  },
];

/** @deprecated Kept for unused marquee; step 1 now uses ORBIT_AVATARS. */
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
