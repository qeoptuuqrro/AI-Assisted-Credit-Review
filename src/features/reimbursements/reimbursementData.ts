import type { StatusPillTone } from "../../shared/ui/StatusPill/StatusPill";

export type ReimbursementStatus =
  | "payment-pending"
  | "pending-review"
  | "declined"
  | "details-requested"
  | "action-required";

export type ReceiptState = "attached" | "missing";
export type PolicyState = "in-policy" | "flagged";

export type Reimbursement = {
  id: string;
  date: string;
  fullDate: string;
  member: string;
  status: ReimbursementStatus;
  amount: number;
  category: string;
  receipt: ReceiptState;
  policy: PolicyState;
  submittedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  mileage?: string;
  rate?: string;
  isMine?: boolean;
};

export const reimbursementStatus: Record<ReimbursementStatus, { label: string; tone: StatusPillTone }> = {
  "payment-pending": { label: "Payment Pending", tone: "success" },
  "pending-review": { label: "Pending Review", tone: "info" },
  declined: { label: "Declined", tone: "danger" },
  "details-requested": { label: "Details Requested", tone: "neutral" },
  "action-required": { label: "Action Required", tone: "danger" },
};

export const initialReimbursements: Reimbursement[] = [
  {
    id: "expense-1",
    date: "Jul 24",
    fullDate: "Jul 23, 2026",
    member: "Jane Black",
    status: "payment-pending",
    amount: 50.25,
    category: "Travel - Vehicles",
    receipt: "missing",
    policy: "in-policy",
    submittedBy: "Jane Black",
    submittedAt: "Jul 23 at 8:00 PM",
    approvedBy: "Landon Shepherd",
    approvedAt: "Jul 23 at 8:00 PM",
    mileage: "75 miles",
    rate: "$0.67/mile",
  },
  {
    id: "expense-2",
    date: "Jul 24",
    fullDate: "Jul 24, 2026",
    member: "Jane Black",
    status: "pending-review",
    amount: 16.75,
    category: "Travel - Vehicles",
    receipt: "missing",
    policy: "in-policy",
    submittedBy: "Jane Black",
    submittedAt: "Jul 24 at 9:18 AM",
  },
  {
    id: "expense-3",
    date: "Jul 22",
    fullDate: "Jul 22, 2026",
    member: "Jane Black",
    status: "declined",
    amount: 35,
    category: "Travel - Flights",
    receipt: "attached",
    policy: "in-policy",
    submittedBy: "Jane Black",
    submittedAt: "Jul 22 at 4:36 PM",
  },
  {
    id: "expense-4",
    date: "Jul 22",
    fullDate: "Jul 22, 2026",
    member: "Jane Black",
    status: "payment-pending",
    amount: 15.82,
    category: "Business Client Meals",
    receipt: "attached",
    policy: "in-policy",
    submittedBy: "Jane Black",
    submittedAt: "Jul 22 at 2:12 PM",
    approvedBy: "Landon Shepherd",
    approvedAt: "Jul 22 at 3:08 PM",
  },
  {
    id: "expense-5",
    date: "Jul 22",
    fullDate: "Jul 22, 2026",
    member: "Jane Black",
    status: "payment-pending",
    amount: 724.75,
    category: "Travel - Flights",
    receipt: "attached",
    policy: "in-policy",
    submittedBy: "Jane Black",
    submittedAt: "Jul 22 at 11:41 AM",
    approvedBy: "Landon Shepherd",
    approvedAt: "Jul 22 at 12:20 PM",
  },
  {
    id: "expense-6",
    date: "Jul 21",
    fullDate: "Jul 21, 2026",
    member: "Jane Black",
    status: "details-requested",
    amount: 480.5,
    category: "Travel - Flights",
    receipt: "attached",
    policy: "in-policy",
    submittedBy: "Jane Black",
    submittedAt: "Jul 21 at 5:25 PM",
  },
  {
    id: "expense-7",
    date: "Oct 1",
    fullDate: "Oct 1, 2026",
    member: "Mary Metcalfe",
    status: "pending-review",
    amount: 338.62,
    category: "Travel - Accommodation",
    receipt: "attached",
    policy: "in-policy",
    submittedBy: "Mary Metcalfe",
    submittedAt: "Oct 1 at 10:04 AM",
  },
  {
    id: "expense-8",
    date: "Oct 1",
    fullDate: "Oct 1, 2026",
    member: "Mary Metcalfe",
    status: "pending-review",
    amount: 27.5,
    category: "Travel - Vehicles",
    receipt: "attached",
    policy: "in-policy",
    submittedBy: "Mary Metcalfe",
    submittedAt: "Oct 1 at 9:42 AM",
  },
  {
    id: "expense-9",
    date: "Oct 1",
    fullDate: "Oct 1, 2026",
    member: "Team Member",
    status: "pending-review",
    amount: 215.78,
    category: "Travel - Vehicles",
    receipt: "attached",
    policy: "in-policy",
    submittedBy: "Team Member",
    submittedAt: "Oct 1 at 9:11 AM",
    isMine: true,
  },
  {
    id: "expense-10",
    date: "Oct 1",
    fullDate: "Oct 1, 2026",
    member: "Alice Chen",
    status: "action-required",
    amount: 167.5,
    category: "Travel - Vehicles",
    receipt: "missing",
    policy: "in-policy",
    submittedBy: "Alice Chen",
    submittedAt: "Oct 1 at 8:54 AM",
  },
  {
    id: "expense-11",
    date: "Jul 5",
    fullDate: "Jul 5, 2026",
    member: "Jessica Awad",
    status: "pending-review",
    amount: 375.87,
    category: "Business Client Meals",
    receipt: "missing",
    policy: "flagged",
    submittedBy: "Jessica Awad",
    submittedAt: "Jul 5 at 1:33 PM",
  },
];

export const categoryOptions = [
  "All categories",
  "Travel - Vehicles",
  "Travel - Flights",
  "Travel - Accommodation",
  "Business Client Meals",
] as const;

export const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});
