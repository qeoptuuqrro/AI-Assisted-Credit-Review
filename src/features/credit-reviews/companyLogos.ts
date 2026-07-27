export const companyLogoDomains = {
  "Meridian Foods": "arc.net",
  "Northstar Health": "linear.app",
  "Brightline Energy": "spline.design",
  "Lakeview Medical": "reflect.app",
  "Cedar Ridge Packaging": "craft.do",
  "Atlas Logistics": "warp.dev",
  "Harbor Retail": "pitch.com",
  "Pioneer Components": "resend.com",
  "Westfield Produce": "granola.ai",
  "Apex Manufacturing": "plane.so",
  "Redwood Distribution": "superlist.com",
  "Stonebridge Healthcare": "tana.inc",
  "Summit Industrial": "relay.app",
  "Oakridge Services": "folk.app",
} as const;

export type ReviewCompanyName = keyof typeof companyLogoDomains;
