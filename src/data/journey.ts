/**
 * Verbatim copy captured from the live journey.
 * Flow order, wording, choices and validation rules are frozen: only presentation may change.
 */

export type FieldType = 'text' | 'email' | 'tel' | 'zip';

export interface FieldDef {
  id: string;
  label: string;
  placeholder: string;
  type: FieldType;
  required: boolean;
  autoComplete?: string;
}

export interface ChoiceDef {
  id: string;
  label: string;
  icon?: 'personal' | 'card' | 'medical' | 'student';
}

export interface CalloutDef {
  title: string;
  body: string;
}

interface BaseStep {
  id: string;
  progress: number;
  eyebrow?: string;
  heading: string;
  question?: string;
  subtext?: string;
  /** Words inside `subtext` rendered with emphasis on the live journey. */
  subtextEmphasis?: string[];
  bullets?: string[];
  guidance?: string[];
  callout?: CalloutDef;
  secureNote?: string;
  disclaimer?: string;
  buttonLabel?: string;
}

export interface ChoiceStep extends BaseStep {
  kind: 'choice';
  choices: ChoiceDef[];
}

export interface FieldsStep extends BaseStep {
  kind: 'fields';
  fields: FieldDef[];
  buttonLabel: string;
}

export interface DateStep extends BaseStep {
  kind: 'date';
  buttonLabel: string;
}

export type Step = ChoiceStep | FieldsStep | DateStep;

export const steps: Step[] = [
  {
    id: 'debt-amount',
    kind: 'choice',
    progress: 14,
    eyebrow: 'YOUR DEBT SNAPSHOT',
    heading: 'Thousands Are Applying Daily For This Loan-Free Relief In 2026',
    question: 'How much total debt do you have?',
    subtext:
      'An estimate is fine - this helps us understand the size of your situation so we can guide you more effectively.',
    choices: [
      { id: '16-20', label: '$16K - $20K' },
      { id: '21-25', label: '$21K - $25K' },
      { id: '26-30', label: '$26K - $30K' },
      { id: '31-35', label: '$31K - $35K' },
      { id: '35-plus', label: '$35K+' },
    ],
    callout: {
      title: 'Did You Know?',
      body: "The average American's credit card debt rose by 15% in the past year, reaching over $7,900 - the highest jump in over two decades.",
    },
  },
  {
    id: 'debt-type',
    kind: 'choice',
    progress: 29,
    eyebrow: 'UNDERSTANDING YOUR FINANCES',
    heading: 'See If You Qualify For Debt Relief',
    subtext:
      'Select the type of debt that you have. Credit cards and personal loans are the best types of debt for these programs.',
    choices: [
      { id: 'personal-loans', label: 'Personal Loans', icon: 'personal' },
      { id: 'credit-card', label: 'Credit Card', icon: 'card' },
      { id: 'medical', label: 'Medical', icon: 'medical' },
      { id: 'student', label: 'Student', icon: 'student' },
    ],
    bullets: [
      '30% - 50% of total debt typically saved.',
      "Checking your eligibility won't affect your credit score.",
    ],
  },
  {
    id: 'contact',
    kind: 'fields',
    progress: 43,
    eyebrow: 'STAY CONNECTED',
    heading: "Let's make sure we've got the right contact details",
    subtext:
      'Confirm your name and email so we can keep you updated and in the loop',
    fields: [
      {
        id: 'firstName',
        label: 'First Name',
        placeholder: 'Enter First Name',
        type: 'text',
        required: true,
        autoComplete: 'given-name',
      },
      {
        id: 'lastName',
        label: 'Last Name',
        placeholder: 'Enter Last Name',
        type: 'text',
        required: true,
        autoComplete: 'family-name',
      },
      {
        id: 'email',
        label: 'Email Address',
        placeholder: 'Enter email',
        type: 'email',
        required: true,
        autoComplete: 'email',
      },
    ],
    secureNote: 'Secured by Forbes.com',
    disclaimer:
      "This information is required by our partners. We'll only send only important updates & exclusive offers. No spam, just relevant updates.",
    buttonLabel: 'Continue',
  },
  {
    id: 'date-of-birth',
    kind: 'date',
    progress: 57,
    eyebrow: 'FIND THE BEST OPTIONS AVAILABLE TO YOU',
    heading: "Let's personalize your results",
    subtext:
      'Your birth date helps providers tailor offers that fit your financial situation and eligibility. This has no impact on your credit score.',
    subtextEmphasis: ['birth date'],
    secureNote:
      'Your information is secure and will never be shared without your permission',
    buttonLabel: 'Continue',
  },
  {
    id: 'phone',
    kind: 'fields',
    progress: 71,
    heading: "What's your phone number?",
    subtext:
      "We use your phone number to confirm your identity securely and show relevant offers. You'll get a one-time code by text. Your privacy is always protected.",
    fields: [
      {
        id: 'phone',
        label: 'Phone Number',
        placeholder: '(555) 555-5555',
        type: 'tel',
        required: true,
        autoComplete: 'tel-national',
      },
    ],
    secureNote:
      'Your information is secure and will never be shared without your permission',
    buttonLabel: 'Continue',
  },
  {
    id: 'income',
    kind: 'choice',
    progress: 86,
    heading: 'What is Your Estimated Annual Income?',
    choices: [
      { id: 'lt-10k', label: 'Less than $10,000' },
      { id: '10-50k', label: '$10,001 - 50,000' },
      { id: '50-100k', label: '$50,000 - 100,000' },
      { id: '100k-plus', label: '$100,000+' },
      { id: 'unsure', label: 'Unsure' },
    ],
    guidance: [
      'Include what you earn from work, retirement, investments, or rental properties.',
      "You don't need to list alimony or child support unless you want it counted.",
      'If you get any non-taxable income, just add 25% to that amount before entering it.',
    ],
  },
  {
    id: 'address',
    kind: 'fields',
    progress: 100,
    heading: "Let's match you with debt relief programs in your area",
    subtext:
      'Confirm or update your address so we can find the right options for you.',
    fields: [
      {
        id: 'address1',
        label: 'Address Line 1',
        placeholder: 'Enter Address Line 1',
        type: 'text',
        required: true,
        autoComplete: 'address-line1',
      },
      {
        id: 'address2',
        label: 'Address Line 2',
        placeholder: 'Enter Address Line 2',
        type: 'text',
        required: false,
        autoComplete: 'address-line2',
      },
      {
        id: 'zip',
        label: 'Zip Code',
        placeholder: 'Enter Zip Code',
        type: 'zip',
        required: true,
        autoComplete: 'postal-code',
      },
    ],
    secureNote: 'Secured by Forbes.com',
    buttonLabel: 'Continue',
  },
];

export const resultScreen = {
  eyebrow: 'Congratulations!',
  heading: 'We have matched you with your personalized Debt Relief provider',
  badge: 'Our pick for you',
  partnerName: 'National Debt Relief',
  status:
    'You’re almost done! A representative will call shortly to help finish the process.',
  bullets: [
    'A+ BBB rating and AFCC accredited',
    'Free consultation and personalized savings estimate',
    'Combine high-interest debts into one low monthly payment',
  ],
  buttonLabel: 'Call Now',
  phoneHref: 'tel:#',
};

export const fallbackScreen = {
  heading:
    "We appreciate your interest and the time you've taken to specify your needs.",
  body: "While we couldn't find a perfect match at this moment, we'd still love to help. You might find what you're looking for by exploring our Personal Loan options.",
};

export const consentPrompt = {
  question:
    'Would you like to share your contact information with Forbes Advisor - SP?',
  indicator: '1 of 1',
};

export const chrome = {
  brand: 'Debt Relief',
  trustBadge: 'Trusted by 100k+ people',
  backLabel: 'Back',
  trustBar: [
    'Share more details',
    'Receive estimates',
    "Determine if it's the right fit",
  ],
  legalLinks: [
    'Advertiser Disclosure',
    'Privacy Policy',
  ],
};

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const days = Array.from({ length: 31 }, (_, i) =>
  String(i + 1).padStart(2, '0'),
);

export const years = Array.from({ length: 2008 - 1901 + 1 }, (_, i) =>
  String(2008 - i),
);
