export const capitalTabs = [
  { id: "home", label: "Home" },
  { id: "working", label: "Working Capital" },
  { id: "venture", label: "Venture Debt" },
  { id: "safes", label: "SAFEs" },
];

export const optionRows = [
  {
    category: "Working capital loans",
    sub: "Ecommerce",
    tags: ["Inventory", "Advertising"],
    funding: "Historical revenue and business fundamentals",
  },
  {
    category: "Roll Up Vehicles",
    sub: "Startups",
    tags: ["Runway", "Payroll", "Acquisitions", "R&D"],
    funding: "Varies",
  },
  {
    category: "Venture debt",
    sub: "VC-funded startups",
    tags: ["Acquisitions", "R&D", "Payroll"],
    funding: "20-35% of the most recent equity round",
  },
  {
    category: "Daily payout",
    sub: "Ecommerce, dropshipping",
    tags: ["Advertising", "Inventory"],
    funding: "Daily revenue",
  },
  {
    category: "R&D tax credits",
    sub: "Startups",
    tags: ["Runway", "Payroll", "Advertising"],
    funding: "Previous year's spend on product development",
  },
  {
    category: "Equity",
    sub: "Startups",
    tags: ["New products", "Payroll", "Acquisitions", "R&D"],
    funding: "Varies",
  },
];

export const workingActivity = [
  ["May 25", "Working capital loan payment", "Mercury Checking ••1038", "-$2,200.00"],
  ["May 21", "Working capital loan payment", "Mercury Checking ••1038", "-$2,200.00"],
  ["May 11", "Working capital deposit", "Mercury Checking ••1038", "$30,000.00"],
  ["May 4", "Working capital loan accrued advance fee", "Mercury Checking ••1038", "-$200.00"],
];

export const upcomingPayments = [
  ["June 1", "$2,199.99", "$42,000.00"],
  ["June 8", "$3,299.97", "$79,000.00"],
  ["June 15", "$3,299.97", "$76,000.00"],
];

export const repaymentRows = [
  ["1", "May 11, 2026", "Failed", "$2,000.00", "$199.99", "$2,199.99", "$0.00", "$48,000.00"],
  ["2", "May 18, 2026", "Paid", "$2,000.00", "$199.99", "$2,199.99", "$2,199.99", "$46,000.00"],
  ["3", "May 25, 2026", "Paid", "$2,000.00", "$199.99", "$2,199.99", "$2,199.98", "$44,000.00"],
  ["4", "Jun 1, 2026", "Upcoming", "$2,000.00", "$199.99", "$2,199.99", "", "$42,000.00"],
  ["5", "Jun 8, 2026", "Upcoming", "$3,000.00", "$299.97", "$3,299.97", "", "$79,000.00"],
  ["6", "Jun 15, 2026", "Upcoming", "$3,000.00", "$299.97", "$3,299.97", "", "$76,000.00"],
];

export const ventureActivity = [
  ["May 21", "Venture Debt Loan Repayment", "Mercury Checking ••1038", "-$1,000.00"],
  ["May 11", "Venture Debt Loan Funding", "Mercury Checking ••1038", "$1,000,000.00"],
];

export const safeRows = [
  {
    initials: "LR",
    name: "Logan Roy",
    email: "logan@roy.co",
    amount: "$1,000.00",
    progress: ["Signed", "Payment received"],
    valuation: ["Post-Money", "$10,000,000.00"],
  },
  {
    initials: "SM",
    name: "Scrooge McDuck",
    email: "scrooge@duckduckgo.com",
    amount: "$10,000,000.00",
    progress: ["Signed", "Payment pending"],
    valuation: ["Pre-Money", "Uncapped"],
  },
  {
    initials: "MB",
    name: "Montgomery Burns",
    email: "boourns@springfieldpower.com",
    amount: "$10,000.00",
    progress: ["Not signed", "Payment pending"],
    valuation: ["Pre-Money", "Uncapped"],
  },
];
