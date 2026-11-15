export type HomeFeatureIcon =
  | "calendar-days"
  | "clipboard-check"
  | "heart-pulse";

export const heroContent = {
  badge: "Your health, made simpler",
  heading: "Healthcare appointments,",
  highlightedHeading: "made simple.",
  description:
    "Take the next step towards your healthcare needs. Find an available appointment, book online, and manage your visits conveniently with CarePoint.",
  primaryButton: "Book an appointment",
  secondaryButton: "My appointments",
  note: "No account required. Use your email to find your bookings.",
};

export const homeFeatures: {
  number: string;
  title: string;
  description: string;
  icon: HomeFeatureIcon;
}[] = [
  {
    number: "01",
    title: "Find an appointment",
    description:
      "Browse available appointment times and choose one that suits your schedule.",
    icon: "calendar-days",
  },
  {
    number: "02",
    title: "Simple online booking",
    description:
      "Provide your name and email to book an available appointment slot.",
    icon: "clipboard-check",
  },
  {
    number: "03",
    title: "Manage your visits",
    description:
      "Look up your bookings using your email and manage your upcoming appointments.",
    icon: "heart-pulse",
  },
];

export const howItWorksContent = {
  badge: "HOW IT WORKS",
  heading: "Three simple steps to get started",
  steps: [
    {
      number: "1",
      title: "Choose your time",
      description:
        "Browse available appointment slots and select a suitable time.",
    },
    {
      number: "2",
      title: "Enter your details",
      description:
        "Provide your name and email address to complete your booking.",
    },
    {
      number: "3",
      title: "Manage your booking",
      description:
        "View your appointment details later using your email address.",
    },
  ],
};

export const callToActionContent = {
  heading: "Ready to book your appointment?",
  description:
    "Explore the available appointment times and arrange your next visit with CarePoint.",
  button: "Get started",
};
