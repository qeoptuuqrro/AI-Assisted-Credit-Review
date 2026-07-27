export type BorrowerContact = {
  id: string;
  initials: string;
  name: string;
  role: string;
  email: string;
  primary?: boolean;
};

export const meridianBorrowerContacts: BorrowerContact[] = [
  { id: "maya-patel", initials: "MP", name: "Maya Patel", role: "CFO", email: "maya.patel@meridianfoods.com", primary: true },
  { id: "daniel-ortiz", initials: "DO", name: "Daniel Ortiz", role: "Corporate Controller", email: "daniel.ortiz@meridianfoods.com" },
  { id: "grace-kim", initials: "GK", name: "Grace Kim", role: "VP, Treasury", email: "grace.kim@meridianfoods.com" },
];

export const northstarBorrowerContacts: BorrowerContact[] = [
  { id: "sarah-lee", initials: "SL", name: "Sarah Lee", role: "CFO", email: "sarah.lee@northstarhealth.com", primary: true },
  { id: "marcus-reed", initials: "MR", name: "Marcus Reed", role: "VP, Finance", email: "marcus.reed@northstarhealth.com" },
  { id: "priya-nair", initials: "PN", name: "Priya Nair", role: "Corporate Controller", email: "priya.nair@northstarhealth.com" },
];

export function contactLabel(contact: BorrowerContact) {
  return `${contact.name} · ${contact.role}`;
}
