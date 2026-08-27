import type { SVGProps } from 'react';
import type { ChoiceDef } from '../data/journey';

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export function PersonalLoanIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </svg>
  );
}

export function CreditCardIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.6" y="5.4" width="18.8" height="13.2" rx="2.4" />
      <path d="M2.6 10h18.8" />
      <path d="M6.4 14.6h3.6" />
    </svg>
  );
}

export function MedicalIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20V6.4A1.4 1.4 0 0 1 5.4 5h9.2A1.4 1.4 0 0 1 16 6.4V20" />
      <path d="M16 11h2.6A1.4 1.4 0 0 1 20 12.4V20" />
      <path d="M2.6 20h18.8" />
      <path d="M10 8.6v4M8 10.6h4" />
    </svg>
  );
}

export function StudentIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4.6 21.4 9 12 13.4 2.6 9 12 4.6Z" />
      <path d="M6.6 11v4.6c0 1.5 2.4 2.8 5.4 2.8s5.4-1.3 5.4-2.8V11" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2} {...props}>
      <path d="m4.8 12.4 4.6 4.6 9.8-10" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4.6" y="10.4" width="14.8" height="9.2" rx="2.2" />
      <path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.2 19.4 6v6.1c0 4.2-3 7.1-7.4 8.7-4.4-1.6-7.4-4.5-7.4-8.7V6L12 3.2Z" />
      <path d="m9 12.2 2.2 2.2 4-4.2" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.8 12h14" />
      <path d="m13.4 6.6 5.4 5.4-5.4 5.4" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m14.4 5.6-6.4 6.4 6.4 6.4" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function ChoiceIcon({
  name,
  ...props
}: { name: NonNullable<ChoiceDef['icon']> } & IconProps) {
  switch (name) {
    case 'personal':
      return <PersonalLoanIcon {...props} />;
    case 'card':
      return <CreditCardIcon {...props} />;
    case 'medical':
      return <MedicalIcon {...props} />;
    case 'student':
      return <StudentIcon {...props} />;
  }
}
