export const routeMeta = {
  tasks: {
    active: "Tasks",
    title: "Tasks",
    subtitle: "Approvals, policy checks, and team requests.",
  },
  transactions: {
    active: "Transactions",
    title: "Transactions",
    subtitle: "",
  },
  accounts: {
    active: "Accounts",
    title: "Accounts",
    subtitle: "Balances, transfer rules, and account details.",
  },
  cards: {
    active: "Cards",
    title: "Cards",
    subtitle: "",
  },
  payments: {
    active: "Payments",
    title: "Payments",
    subtitle: "",
  },
  invoicing: {
    active: "Invoicing",
    title: "Invoicing",
    subtitle: "",
  },
  billPay: {
    active: "Bill Pay",
    title: "Bill Pay",
    subtitle: "Outstanding bills, approvals, scheduled drafts, and inbox intake.",
  },
  reimbursements: {
    active: "Reimbursements",
    title: "Reimbursements",
    subtitle: "",
  },
  settings: {
    active: "Settings",
    title: "Mercury Demo",
    subtitle: "Company profile, controls, integrations, and personal settings.",
  },
};

export const tasks = [
  ["Review pending emails that can auto-forward to receipts@mercury.com", "May 25", "Receipt automation", "Incomplete"],
  ["Landon Shepherd requested a receipt policy exemption on a transaction at Monarch Books.", "May 25", "Spend policy", "Incomplete"],
  ["Review category for your $300.03 Uber Eats transaction", "May 25", "Accounting", "Incomplete"],
  ["Approve team invite for Bruce Collins (requested by Landon Shepherd)", "May 24", "Team", "Incomplete"],
  ["Approve $1,042.95 payment to Jason Green (requested by Alice C.)", "May 24", "Payment", "Incomplete"],
  ["Approve $5,000.00 recurring payment to Jason Green (requested by Alice C.)", "May 24", "Recurring payment", "Incomplete"],
  ["Approve new daily maximum payment limit (requested by Landon Shepherd)", "May 24", "Controls", "Incomplete"],
  ["Approve enabling the dual admin approval policy (requested by Landon Shepherd)", "May 24", "Approval rule", "Incomplete"],
  ["Approve $375.87 reimbursement from Jessica Awad at The Bayside Bistro", "May 24", "Reimbursement", "Incomplete"],
];

export const accounts = [
  ["Credit Card", "Mercury IO", "$12,505.87", "Autopay from Ops / Payroll", "Every 22nd of the month or if <80% of limit left"],
  ["Treasury", "", "$200,000.00", "Create rule", ""],
  ["Ops / Payroll", "Checking &bull;&bull;1038", "$2,023,267.12", "Create rule", ""],
  ["AP", "Checking &bull;&bull;1794", "$226,767.82", "Create rule", ""],
  ["AR", "Checking &bull;&bull;4296", "$0.00", "Create rule", ""],
  ["Checking &bull;&bull;0297", "", "$1,374,471.14", "Create rule", ""],
  ["Savings &bull;&bull;7658", "", "$1,320,201.00", "Create rule", ""],
];

export const cardRows = [
  ["Jane Black", "You", "&bull;&bull;5555 Jane's IO card", "$0.00", "Physical", "Credit Card", "Active"],
  ["Jane Black", "", "&bull;&bull;0330 AWS billing", "$1,500.00", "Virtual", "Credit Card", "Active"],
  ["Jane Black", "", "&bull;&bull;3054 Facebook ads", "$1,500.00", "Virtual", "Credit Card", "Active"],
  ["Jane Black", "", "&bull;&bull;3745", "$551.00", "Physical", "Checking &bull;&bull;0297", "Active"],
  ["Jane Black", "", "&bull;&bull;4928 Grocery/Meals", "$0.00", "Virtual", "Ops / Payroll", "Active"],
  ["Jane Black", "", "&bull;&bull;6112 Column Card", "$2,987.00", "Virtual", "Checking", "Active"],
  ["Jane Black", "", "&bull;&bull;6871", "$110.00", "Physical", "Checking &bull;&bull;0297", "Suspended"],
  ["Jane Black", "", "&bull;&bull;8628 Travel expenses", "$0.00", "Virtual", "Credit Card", "Suspended"],
  ["Alice Chen", "", "&bull;&bull;7840", "$0.00", "Physical", "Checking &bull;&bull;0297", "Active"],
  ["Alice Chen", "", "&bull;&bull;1234 Office Card", "$10,789.00", "Virtual", "Checking &bull;&bull;0297", "Active"],
  ["Alice Chen", "", "&bull;&bull;6231", "$110.00", "Physical", "Checking &bull;&bull;0297", "Active"],
  ["Alice Chen", "", "&bull;&bull;0330 Contractor Expenses", "$199.00", "Physical", "Credit Card", "Frozen"],
  ["Bruce Collins", "", "Office supplies", "$0.00", "Virtual", "Credit Card", "Pending"],
  ["Bruce Collins", "", "IO card", "$0.00", "Virtual", "Credit Card", "Pending"],
  ["Carry Beck", "", "&bull;&bull;7821 Carry's Card", "$0.00", "Physical", "Credit Card", "Active"],
  ["Dave Walker", "", "&bull;&bull;7742 Dave's Card", "$0.00", "Physical", "Credit Card", "Printing"],
  ["Jessica Awad", "", "&bull;&bull;4039 Jessica's Card", "$0.00", "Physical", "Credit Card", "Active"],
];

export const transactions = [
  ["May 26", "Stefanie Katz", "SK", "-$1,234.56", "AP", "Check Payment", "", "400 - Inventory", "Matched"],
  ["May 25", "Mercury Working Capital", "mark", "-$2,200.00", "Ops / Payroll", "Working Capital Loan Payment", "", "", "Matched"],
  ["May 25", "Payment from NASA", "P", "$419.00", "AR", "Request or Invoice Payment", "", "", "Failed"],
  ["May 25", "Payment from Acme Corp", "P", "$200.00", "AR", "Request or Invoice Payment", "", "", "None"],
  ["May 25", "To Ops / Payroll", "mark", "-$55,810.16", "AR", "Transfer", "", "", "None"],
  ["May 25", "From AR", "mark", "$55,810.16", "Ops / Payroll", "Transfer", "", "", "None"],
  ["May 25", "Lily's Eatery", "LE", "$0.93", "Ops / Payroll", "Alice C. &bull;&bull;1234", "", "", "Requested"],
  ["May 25", "Deli 77", "D7", "$63.53", "Credit account", "Mary M. &bull;&bull;0332", "Business Client Meals", "215 - Accounts Payable", "Matched"],
  ["May 25", "Deli 77", "D7", "$214.06", "Ops / Payroll", "Jane B. &bull;&bull;6112", "Business Client Meals", "215 - Accounts Payable", "Matched"],
  ["May 25", "Office Stop Co.", "OS", "-$287.89", "Ops / Payroll", "Jessica A. &bull;&bull;9914", "Office Supplies", "", "Missing"],
  ["May 25", "Trader John's", "TJ", "$855.81", "Credit account", "Landon S. &bull;&bull;0331", "Lunch Perks", "215 - Accommodation", "Matched"],
  ["May 25", "Pending Deposit", "PD", "$1,000.00", "AP", "Check Deposit", "", "404 - Incoming", "None"],
];

export const billRows = [
  ["Apr 2025", "Overdue", "Debug LLC", "$220.00", "INV-902", "May 25", "Review"],
  ["Dec 2025", "Overdue", "Nano Tech LLC", "$1,290.00", "INV-001", "May 25", "Review"],
  ["Jan 17", "Overdue", "Tax Bureau Inc", "$11,600.00", "INV-883346", "May 25", "Review"],
];

export const invoiceRows = [
  ["Aphelion Financial Advisors", "billing@aphelionfa.com", "$16,500.00", "INV-0007", "Mar 21", "One time", "Apr 20", "Overdue", "1 month ago"],
  ["Solstice Marketing Group", "ap@solsticemarketing.com", "$15,000.00", "INV-0008", "Mar 31", "One time", "Apr 30", "Overdue", "25 days ago"],
  ["Polaris Legal Services", "billing@polarislegal.com", "$7,500.00", "INV-0006", "Apr 5", "One time", "May 5", "Overdue", "20 days ago"],
  ["Orbital Advisory Partners", "invoices@orbitaladvisory.com", "$7,500.00", "INV-0013", "May 25", "One time", "Jun 24", "Scheduled", "in 1 month"],
  ["Quasar Design Studio", "hello@quasardesign.co", "$6,000.00", "INV-0014", "May 25", "One time", "Jun 24", "Scheduled", "in 1 month"],
  ["Nebula Strategy Group", "ap@nebulastrategy.co", "$7,500.00", "INV-0001", "Apr 10", "Monthly", "May 1", "Active", "24 days ago"],
  ["Nebula Strategy Group", "ap@nebulastrategy.co", "$7,500.00", "INV-0010", "May 20", "Monthly", "Jun 19", "Active", "in 25 days"],
  ["Astral Creative Co", "finance@astralcreative.co", "$2,500.00", "-", "-", "Payment link", "Jun 21", "Active", "in 27 days"],
  ["Vega Compliance Partners", "ap@vegacompliance.com", "$4,500.00", "INV-0011", "May 23", "One time", "Jun 22", "Active", "in 28 days"],
  ["Meridian Consulting", "invoices@meridianconsulting.co", "$2,000.00", "INV-0012", "May 24", "One time", "Jun 23", "Active", "in 29 days"],
  ["Polaris Legal Services", "billing@polarislegal.com", "$5,000.00", "INV-0015", "May 15", "One time", "Jun 14", "Processing", "in 20 days"],
  ["Aphelion Financial Advisors", "billing@aphelionfa.com", "$750.00", "INV-0020", "May 21", "One time", "Jun 20", "Processing", "in 26 days"],
  ["Solstice Marketing Group", "ap@solsticemarketing.com", "$1,000.00", "-", "-", "Payment link", "-", "Paid", ""],
  ["Zenith Capital Firm", "accounts@zenithcapital.co", "$3,000.00", "INV-0004", "Apr 15", "One time", "May 15", "Paid", ""],
  ["Nebula Strategy Group", "ap@nebulastrategy.co", "$7,500.00", "INV-0009", "Apr 10", "One time", "May 10", "Paid", ""],
  ["Zenith Capital Firm", "accounts@zenithcapital.co", "$3,500.00", "INV-0030", "Apr 1", "Monthly", "May 1", "Paid", ""],
  ["Orbital Advisory Partners", "invoices@orbitaladvisory.com", "$5,000.00", "INV-0002", "Mar 26", "One time", "Apr 25", "Paid", ""],
  ["Quasar Design Studio", "hello@quasardesign.co", "$4,000.00", "INV-0003", "Mar 11", "One time", "Apr 10", "Paid", ""],
  ["Meridian Consulting", "invoices@meridianconsulting.co", "$2,000.00", "INV-0005", "Mar 1", "One time", "Mar 31", "Paid", ""],
];

export const reimbursementRows = [
  ["May 24", "Jane Black", "Payment Pending", "$50.25", "Travel - Vehicles", "-", "Within policy"],
  ["May 24", "Jane Black", "Pending Review", "$16.75", "Travel - Vehicles", "-", "Needs review"],
  ["May 22", "Jane Black", "Declined", "$35.00", "Travel - Flights", "Attached", "Declined"],
  ["May 22", "Jane Black", "Payment Pending", "$15.82", "Business Client Meals", "Attached", "Within policy"],
  ["May 22", "Jane Black", "Payment Pending", "$724.75", "Travel - Flights", "Attached", "Within policy"],
  ["May 21", "Jane Black", "Details Requested", "$480.50", "Travel - Flights", "Attached", "Needs details"],
  ["Oct 1", "Mary Metcalfe", "Pending Review", "$338.62", "Travel - Accommodation", "Attached", "Needs review"],
  ["Oct 1", "Mary Metcalfe", "Pending Review", "$27.50", "Travel - Vehicles", "Attached", "Needs review"],
  ["Oct 1", "Team Member", "Pending Review", "$215.78", "Travel - Vehicles", "Attached", "Needs review"],
  ["Oct 1", "Alice Chen", "Action Required", "$167.50", "Travel - Vehicles", "-", "Needs receipt"],
  ["Jul 5", "Jessica Awad", "Pending Review", "$375.87", "Business Client Meals", "-", "Needs review"],
];

export const settingsSections = [
  ["Legal name", "Mercury Demo, Incorporated", "The legal business name on bank documents."],
  ["Doing business as (DBA)", "Mercury Demo, Incorporated", "Default company display name."],
  ["Federal EIN", "&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;", "Masked tax identification number."],
  ["Company name", "Mercury Demo", "This is the name that appears in Mercury and in notifications."],
  ["Company logo", "Mercury orbital mark", "This appears next to your company name."],
  ["Phone number", "+1 (800) 000-0000", "Primary company phone number."],
  ["Bill forwarding email", "my-company-name@ap.mercury.com", "Team members and vendors can send bills directly to this address."],
  ["Company mailing address", "123 SW Example Ave, Floor 99, Portland, OR 97221", "Physical cards and surprise gifts are sent here."],
  ["Company legal address", "2261 Market St, Suite 86807, San Francisco, CA 94114", "Address from formation documents and bank records."],
  ["Company card name", "Mercury Demo", "Name printed on all physical cards."],
];
