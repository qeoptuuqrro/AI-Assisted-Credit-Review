export type LearningLevel = "simple" | "professional";

export type MeridianLearningTopicId =
  | "page-story"
  | "walkthrough-start"
  | "walkthrough-intake"
  | "walkthrough-repayment"
  | "walkthrough-assessment"
  | "walkthrough-findings"
  | "walkthrough-progress"
  | "walkthrough-recommendation"
  | "walkthrough-decision"
  | "case-header"
  | "review-navigation"
  | "initial-assessment"
  | "facility-request"
  | "facility-term"
  | "initial-use"
  | "pro-forma-leverage"
  | "source-readiness"
  | "fixed-charge-coverage"
  | "coverage-chart"
  | "review-priorities"
  | "customer-concentration"
  | "declining-margins"
  | "increasing-leverage"
  | "findings-overview-story"
  | "findings-ledger"
  | "findings-preview"
  | "finding-page-story"
  | "finding-initial-assessment"
  | "finding-evidence-update"
  | "finding-assessment-basis"
  | "finding-source-set"
  | "finding-judgment"
  | "financials-story"
  | "financials-metrics"
  | "financials-trend"
  | "financials-scenarios"
  | "financials-drivers"
  | "sources-story"
  | "sources-readiness"
  | "sources-ledger"
  | "source-review-story"
  | "source-verification"
  | "source-document"
  | "source-provenance"
  | "source-review-actions"
  | "activity-story"
  | "activity-filters"
  | "activity-timeline"
  | "recommendation-story"
  | "recommendation-readiness"
  | "recommendation-sections"
  | "recommendation-authoring"
  | "recommendation-context"
  | "senior-decision-story"
  | "senior-recommendation"
  | "senior-findings"
  | "senior-final-action"
  | "northstar-overview"
  | "northstar-findings"
  | "northstar-financials"
  | "northstar-sources"
  | "northstar-activity"
  | "northstar-recommendation"
  | "standard-overview"
  | "standard-findings"
  | "standard-sources"
  | "standard-activity"
  | "standard-recommendation"
  | "queue-overview"
  | "queue-statuses"
  | "queue-filters"
  | "queue-preview"
  | "senior-queue-overview"
  | "senior-queue-filters"
  | "senior-queue-preview"
  | "overview-command-center"
  | "overview-workload"
  | "intelligence-workflow"
  | "intelligence-answer"
  | "reimbursements-ledger"
  | "reimbursements-filters"
  | "reimbursements-drawer";

export type MeridianLearningScope =
  | "workspace-overview"
  | "walkthrough"
  | "findings-overview"
  | "finding"
  | "financials"
  | "sources-index"
  | "source-review"
  | "activity"
  | "recommendation"
  | "recommendation-draft"
  | "senior-decision"
  | "senior-review";

export type PlatformLearningScope =
  | "northstar-overview"
  | "northstar-findings"
  | "northstar-financials"
  | "northstar-sources"
  | "northstar-activity"
  | "northstar-recommendation"
  | "standard-overview"
  | "standard-findings"
  | "standard-sources"
  | "standard-activity"
  | "standard-recommendation"
  | "queue"
  | "senior-queue"
  | "overview"
  | "intelligence"
  | "reimbursements";
  

export type MeridianLearningTopic = {
  id: MeridianLearningTopicId;
  category: string;
  title: string;
  shortLabel: string;
  simple: string;
  professional: string;
  example?: string;
  aiSteps: string[];
  whyHere: string;
  presenterLine: string;
  sourceTrail: string[];
  humanCheck: string;
};

export const meridianLearningTopics: MeridianLearningTopic[] = [
  {
    id: "page-story",
    category: "Start here",
    title: "What this page is telling you",
    shortLabel: "Page overview",
    simple: "Meridian Foods wants a flexible $18 million bank line for everyday business needs. The AI read the case documents, tested whether the company can carry the debt, and found three issues a credit analyst still needs to judge. Its early view is: the deal may work, but only with protections and follow-up.",
    professional: "This is an initial credit-review summary for an $18 million working-capital revolver. It combines proposed facility terms, repayment-capacity metrics, scenario analysis, evidence readiness, and unresolved risk findings. It is a decision-support view, not a final credit decision.",
    aiSteps: [
      "Ingested and validated 12 financial, bank, contract, forecast, and credit documents.",
      "Normalized the extracted values and calculated coverage, leverage, margin, and concentration signals.",
      "Compared actual and forecast performance with proposed covenant levels and monitoring thresholds.",
      "Surfaced three findings and produced an initial assessment for human review.",
    ],
    whyHere: "A reviewer should understand the proposed deal, the ability to repay, and the few issues that could change the decision without opening every source document first.",
    presenterLine: "This is the case landing page: it compresses the deal, the AI's initial view, and the three questions a human still has to resolve.",
    sourceTrail: ["12 case documents", "Calculated financial signals", "Three unresolved findings"],
    humanCheck: "The AI organizes evidence and proposes a view. An analyst verifies sources, challenges assumptions, and owns the recommendation; a senior approver owns the decision.",
  },
  {
    id: "walkthrough-start",
    category: "Guided walkthrough · Step 1 of 8",
    title: "The case arrives",
    shortLabel: "1 · Case intake",
    simple: "Meridian Foods asks the bank for an $18 million reusable line to cover timing gaps in its day-to-day business. The review starts as a request, not as an approval. The job is to decide whether the bank can be repaid and what protections are needed.",
    professional: "The case is an underwriting request for an $18 million, three-year working-capital revolver. The initial workflow establishes the borrower, facility structure, owner, and decision deadline before any risk conclusion is formed.",
    aiSteps: [
      "Matched the request to the Meridian Foods borrower record.",
      "Read the proposed commitment, facility type, tenor, owner, and due date.",
      "Created a review workspace so every conclusion can be traced back to evidence.",
    ],
    whyHere: "This is the starting point: it tells you what Meridian wants and keeps the rest of the page anchored to that request.",
    presenterLine: "We begin with a request for an $18 million operating line. Nothing is approved yet; the rest of the review tests whether that request is supportable.",
    sourceTrail: ["Case record", "Transaction request", "Draft credit agreement"],
    humanCheck: "Confirm the borrower, amount, intended use, ownership, and deadline before relying on any downstream analysis.",
  },
  {
    id: "walkthrough-intake",
    category: "Guided walkthrough · Step 2 of 8",
    title: "Documents and data enter the review",
    shortLabel: "2 · Evidence intake",
    simple: "The AI receives 12 documents: financial statements, a debt schedule, forecasts, contracts, and the draft loan terms. It extracts numbers and links them to their sources. Nine are ready to use; three still need a check, so the AI shows uncertainty instead of hiding it.",
    professional: "The ingestion layer extracts and normalizes 12 source artifacts, then runs completeness, freshness, and consistency checks. Nine sources are decision-ready and three remain in an attention state. Calculations can be prepared before all evidence is fully verified, but final judgment cannot skip material exceptions.",
    aiSteps: [
      "Parsed the financial, debt, contract, forecast, and credit documents.",
      "Linked extracted facts to source pages or tables and checked for conflicts.",
      "Marked 9 of 12 sources ready and left 3 visible for analyst follow-up.",
    ],
    whyHere: "A number is only useful when you can tell where it came from and whether that source is reliable enough for a decision.",
    presenterLine: "The AI turns a 12-document package into linked evidence, while keeping the three sources that still need checking visible to the analyst.",
    sourceTrail: ["12 case documents", "Extraction status", "Source-review state"],
    humanCheck: "Open any source that affects a material conclusion and confirm the document, date, and extracted values.",
  },
  {
    id: "walkthrough-repayment",
    category: "Guided walkthrough · Step 3 of 8",
    title: "AI checks whether the debt can be carried",
    shortLabel: "3 · Repayment capacity",
    simple: "The AI compares the money Meridian generates with the payments it must make. Today the cushion is 1.41x: about $1.41 available for each $1.00 of fixed payments, versus a proposed 1.20x minimum. It also tests weaker conditions, where coverage falls to 1.12x and leverage could rise if an equipment obligation counts as debt.",
    professional: "The repayment review combines fixed-charge coverage, pro forma leverage, historical trend, and base/downside scenarios. Current coverage is 1.41x against a proposed 1.20x floor; downside coverage is 1.12x. Pro forma leverage is 3.7x versus a proposed 4.25x maximum, subject to a $2.1 million debt-classification question.",
    aiSteps: [
      "Calculated the bank-defined fixed-charge coverage ratio from cash-flow and payment inputs.",
      "Applied the proposed opening draw to post-transaction debt and leverage.",
      "Ran base and downside assumptions through the coverage and leverage tests.",
      "Kept the equipment-obligation classification open instead of treating it as settled.",
    ],
    whyHere: "The decision is about future repayment, not just the size of today's line. The chart and ratios show both the cushion and what could consume it.",
    presenterLine: "The base case has payment cushion, but weaker margins and an unresolved debt classification reduce the room for error.",
    sourceTrail: ["Q2 2026 financials", "Debt schedule", "Covenant package", "Downside scenario"],
    humanCheck: "Verify the bank-specific formulas, EBITDA adjustments, payment assumptions, and downside severity.",
  },
  {
    id: "walkthrough-assessment",
    category: "Guided walkthrough · Step 4 of 8",
    title: "The AI forms an initial view",
    shortLabel: "4 · Initial view",
    simple: "Because the expected case appears workable but the weaker case needs protection, the AI says “Proceed with conditions.” That means “keep reviewing with safeguards,” not “approved.” A human still has to validate the assumptions and choose the actual conditions.",
    professional: "The initial assessment is a conditional underwriting hypothesis. It reflects acceptable base-case repayment capacity alongside downside covenant pressure and unresolved risk signals. It is not a credit approval or a substitute for analyst and senior-officer judgment.",
    aiSteps: [
      "Compared the base case with the proposed coverage and leverage thresholds.",
      "Noted that downside coverage breaches the proposed 1.20x floor.",
      "Combined the repayment view with three unresolved risk findings.",
      "Mapped that evidence to a conditional initial assessment.",
    ],
    whyHere: "The label gives the reviewer a starting hypothesis while making the remaining work explicit.",
    presenterLine: "The AI is saying this may work if we add protections and resolve the open questions; it is not saying the bank has approved the facility.",
    sourceTrail: ["Coverage analysis", "Leverage analysis", "Three review findings"],
    humanCheck: "The analyst decides whether the proposed conditions are sufficient and writes the recommendation; the senior approver owns the final decision.",
  },
  {
    id: "walkthrough-findings",
    category: "Guided walkthrough · Step 5 of 8",
    title: "Three findings become the review questions",
    shortLabel: "5 · Three findings",
    simple: "The AI does not invent three problems at random. It compares the evidence with thresholds and trends, then groups the biggest decision-changing questions: two customers make up 61% of sales; margins fell from 14.2% to 9.1%; and debt is 3.7x earnings with one classification still open. These are questions to investigate, not final verdicts.",
    professional: "The finding engine converts quantified exceptions into three non-duplicative adjudication items: customer concentration above the 50% monitoring threshold, EBITDA-margin compression with downside coverage below the floor, and increased pro forma leverage with an unresolved equipment-obligation classification.",
    aiSteps: [
      "Compared customer concentration, margin, coverage, and leverage signals with policy and deal thresholds.",
      "Grouped related signals so the same issue is not counted multiple times.",
      "Assigned an initial severity and workflow state to each finding.",
      "Linked each finding to the evidence that supports it.",
    ],
    whyHere: "The three rows focus the analyst on the small set of issues most likely to change the decision across a 12-document package.",
    presenterLine: "The AI has reduced the package to three reviewable questions: customer dependency, shrinking profit cushion, and debt headroom.",
    sourceTrail: ["Customer concentration report", "Q2 2026 financials", "Debt schedule", "Forecast and covenant thresholds"],
    humanCheck: "Read the linked evidence and decide whether each finding should be accepted, revised, or escalated.",
  },
  {
    id: "walkthrough-progress",
    category: "Guided walkthrough · Step 6 of 8",
    title: "Findings control review progress",
    shortLabel: "6 · Review progress",
    simple: "Material and Moderate describe how serious a risk may be. They are not the same as the work status. “Needs judgment” means Alex must make a decision. “Needs verification” means Alex must check evidence first. The review cannot be complete while required findings remain unresolved.",
    professional: "Severity and workflow are separate dimensions. Material and Moderate are risk bands; Needs judgment, Needs verification, Analysis ready, and Escalated describe the next workflow action. Completion is driven by finding dispositions and any required evidence or reassessment—not by the AI label alone.",
    example: "Meridian currently has two Material findings and one Moderate finding, but that does not mean there are only two possible outcomes or that the labels are final.",
    aiSteps: [
      "Used thresholds and evidence confidence to propose Material or Moderate.",
      "Set the next action based on whether the issue needs a person’s judgment or source verification.",
      "Kept recommendation readiness blocked until required findings are addressed.",
      "Updated case progress when a finding is accepted, revised, or escalated.",
    ],
    whyHere: "This prevents a reviewer from mistaking an AI risk label for a completed decision and makes the remaining work visible.",
    presenterLine: "Severity tells us how much an issue could matter; workflow status tells us what Alex has to do next.",
    sourceTrail: ["Finding states", "Evidence states", "Analyst judgments", "Recommendation readiness"],
    humanCheck: "Resolve each required finding with evidence and a written rationale; escalate when the issue cannot be resolved at analyst level.",
  },
  {
    id: "walkthrough-recommendation",
    category: "Guided walkthrough · Step 7 of 8",
    title: "The analyst writes the recommendation",
    shortLabel: "7 · Recommendation",
    simple: "After the findings are addressed, Alex turns the evidence into a recommendation: approve, approve with conditions, return for more work, or decline. The recommendation explains the protections, monitoring, and any remaining uncertainty. It is Alex’s accountable credit judgment, not a sentence generated by the dashboard.",
    professional: "Once required findings reach an addressed state, the analyst drafts the recommendation and conditions, documenting mitigants, covenant expectations, evidence limitations, and residual risk. The recommendation is a separate authored artifact from the system assessment.",
    aiSteps: [
      "Collected finding dispositions, verified evidence, and any scoped reassessments.",
      "Exposed the remaining risk and proposed controls for the analyst to weigh.",
      "Enabled recommendation drafting only when the required workflow is complete.",
    ],
    whyHere: "A decision-maker needs a concise, accountable explanation of what the bank should do and why.",
    presenterLine: "Once the questions are resolved, Alex writes the recommendation and the protections that make the request acceptable—or explains why it is not.",
    sourceTrail: ["Finding dispositions", "Verified evidence", "Analyst rationale", "Recommendation draft"],
    humanCheck: "The analyst owns the wording, conditions, residual-risk explanation, and factual support for the recommendation.",
  },
  {
    id: "walkthrough-decision",
    category: "Guided walkthrough · Step 8 of 8",
    title: "Senior credit makes the final decision",
    shortLabel: "8 · Senior decision",
    simple: "A senior credit officer reviews Alex’s recommendation, the evidence, the findings, and the audit trail. They can approve, approve with conditions, send it back for more work, or decline. That final decision is a human governance step, separate from the AI’s initial assessment.",
    professional: "Senior review is the final control point. The approver evaluates the authored recommendation, resolved and escalated findings, covenant package, source provenance, and residual risk before recording an approval, conditional approval, return, or decline.",
    aiSteps: [
      "Presented the complete recommendation package and supporting audit trail.",
      "Kept the original AI assessment and all human changes distinguishable.",
      "Recorded the senior outcome as the final decision event.",
    ],
    whyHere: "Separating analysis, recommendation, and approval preserves accountability and makes the decision explainable later.",
    presenterLine: "The AI accelerates the review, Alex owns the recommendation, and senior credit owns the final decision.",
    sourceTrail: ["Recommendation", "Finding judgments", "Activity history", "Senior decision record"],
    humanCheck: "The senior approver must independently assess the package and record the decision and rationale.",
  },
  {
    id: "case-header",
    category: "Case identity",
    title: "Meridian Foods and the header details",
    shortLabel: "Case header",
    simple: "Meridian Foods is the company asking the bank for money. The small labels summarize the request: up to $18 million, reusable for three years, assigned to Alex Kim, and due today.",
    professional: "The object header identifies the borrower, requested commitment, facility type and tenor, review owner, and service deadline. These fields come from the case record and proposed credit terms rather than from the AI's risk judgment.",
    aiSteps: [
      "Matched the uploaded package to the Meridian Foods case record.",
      "Read the proposed commitment and tenor from the draft credit agreement.",
      "Pulled owner and due date from workflow metadata.",
    ],
    whyHere: "It prevents reviewers from confusing the borrower, request, owner, or deadline when moving between multiple active cases.",
    presenterLine: "The header anchors us: who the borrower is, what they are asking for, who owns the review, and when it is due.",
    sourceTrail: ["Case record", "Draft credit agreement", "Workflow assignment"],
    humanCheck: "Operations or the relationship team should correct identity and assignment data if the case record is wrong.",
  },
  {
    id: "review-navigation",
    category: "Workflow",
    title: "Why the review has these tabs",
    shortLabel: "Review tabs",
    simple: "Each tab answers a different question: What is the big picture? What looks risky? Do the numbers support repayment? Which documents prove it? What changed and who did it?",
    professional: "The tabs separate decision summary, finding adjudication, financial analysis, source provenance, and audit history. A recommendation appears once the required finding workflow is complete.",
    aiSteps: [
      "Connected each extracted fact to a source document.",
      "Grouped material signals into findings and financial views.",
      "Recorded AI and human actions in an activity trail.",
    ],
    whyHere: "The reviewer can move from conclusion to evidence and back without losing the case context or audit trail.",
    presenterLine: "The information architecture follows the credit decision: summary, issues, numbers, evidence, then audit history.",
    sourceTrail: ["Case workflow state", "Finding-to-source links", "Activity log"],
    humanCheck: "Tabs organize the review; their presence does not mean every underlying item has been verified.",
  },
  {
    id: "initial-assessment",
    category: "AI assessment",
    title: "Proceed with conditions",
    shortLabel: "Initial assessment",
    simple: "The AI is not saying “approve.” It is saying the company appears able to handle the loan in the expected case, but the bank should add safety rules and resolve the open concerns before moving forward.",
    professional: "The base case appears to support repayment, while customer concentration, margin recovery, and leverage leave limited protection in weaker conditions. The initial view is therefore conditional rather than an unqualified proceed or decline.",
    example: "Think: “This can work if the risks are controlled,” not “The loan is approved.”",
    aiSteps: [
      "Calculated current and forecast repayment capacity from the financial package.",
      "Tested a base case and a downside case against the proposed covenants.",
      "Detected three material or moderate risk findings that still need human judgment.",
      "Mapped that combination to the initial view “Proceed with conditions.”",
    ],
    whyHere: "The reviewer needs a clear starting hypothesis, but also needs to see that the hypothesis is conditional and reviewable.",
    presenterLine: "The AI's recommendation is deliberately an initial view: the base case works, but it is asking a human to validate three risks and the protections around them.",
    sourceTrail: ["Q2 2026 financials", "Revenue and margin forecast", "Debt schedule", "Draft credit agreement"],
    humanCheck: "Only a human can accept the assumptions, choose the conditions, write the recommendation, and approve or decline the request.",
  },
  {
    id: "facility-request",
    category: "Deal terms",
    title: "$18M working-capital revolver",
    shortLabel: "$18M facility",
    simple: "The bank would let Meridian borrow up to $18 million to cover normal timing gaps—like paying suppliers before customers pay invoices. “Revolver” means Meridian can borrow, repay, and borrow again while the line is active.",
    professional: "The $18 million figure is the committed facility limit, not necessarily cash funded on day one. A working-capital revolving facility supports short-term operating assets and permits repeated draws and repayments subject to availability and credit terms.",
    example: "It works more like a business credit line than a one-time $18 million check.",
    aiSteps: [
      "Extracted the commitment amount and facility type from the proposed credit terms.",
      "Reconciled the requested structure with the draft credit agreement.",
    ],
    whyHere: "Every risk and repayment calculation should be interpreted relative to the size and structure of the requested facility.",
    presenterLine: "Meridian is asking for an $18 million reusable operating line, not an $18 million lump-sum loan on day one.",
    sourceTrail: ["Case request", "Draft credit agreement"],
    humanCheck: "A credit officer must confirm final commitment, eligible uses, borrowing-base rules, pricing, and documentation.",
  },
  {
    id: "facility-term",
    category: "Deal terms",
    title: "Term: 3 years",
    shortLabel: "3-year term",
    simple: "The credit line would stay available for three years. At the end, it must be renewed, replaced, or paid off according to the agreement.",
    professional: "The three-year tenor defines the committed availability period and maturity. It shapes forecast coverage, refinancing risk, monitoring requirements, and the period over which covenants apply.",
    aiSteps: ["Read the proposed maturity and availability period from the draft credit agreement.", "Used the tenor to select the relevant forecast horizon."],
    whyHere: "A reviewer needs to know how long the bank is exposed and whether the analysis covers that period.",
    presenterLine: "The bank is taking three years of exposure, so the forecast and controls need to remain credible across that window.",
    sourceTrail: ["Draft credit agreement", "Revenue and margin forecast"],
    humanCheck: "Legal documentation controls the final maturity date and any extension options.",
  },
  {
    id: "initial-use",
    category: "Deal terms",
    title: "Initial use: $11.7M",
    shortLabel: "$11.7M initial use",
    simple: "Meridian expects to use $11.7 million when the line opens—about 65% of the $18 million limit. The rest stays available for later working-capital needs.",
    professional: "The expected initial draw is $11.7 million, or 65% utilization at close. It feeds the pro forma debt and coverage analysis while leaving approximately $6.3 million of undrawn commitment, subject to availability.",
    example: "$18.0M limit − $11.7M expected draw = about $6.3M not initially used.",
    aiSteps: ["Extracted the proposed uses and opening draw from the transaction materials.", "Calculated utilization as $11.7M divided by $18.0M.", "Applied the draw to the post-transaction debt case."],
    whyHere: "Repayment risk depends on expected debt actually used, while liquidity value also depends on how much capacity remains available.",
    presenterLine: "The company expects to draw 65% at close, which drives the debt analysis and leaves some liquidity in reserve.",
    sourceTrail: ["Transaction request", "Draft credit agreement", "Financial model"],
    humanCheck: "The analyst should confirm use-of-proceeds detail and that the expected draw matches the closing funds flow.",
  },
  {
    id: "pro-forma-leverage",
    category: "Repayment risk",
    title: "Pro forma leverage: 3.7x",
    shortLabel: "3.7× leverage",
    simple: "After including the proposed borrowing, Meridian would have about $3.70 of debt for every $1.00 of annual operating earnings used in this calculation. Higher leverage usually means less room for mistakes.",
    professional: "Pro forma leverage is post-transaction funded debt divided by adjusted EBITDA. The displayed 3.7x is below the proposed 4.25x maximum, but an unresolved $2.1 million equipment-obligation classification could add roughly 0.2x.",
    example: "The number is a ratio, not an interest rate: 3.7x means debt is 3.7 times the measured annual earnings base.",
    aiSteps: ["Read funded debt from the debt schedule and current financials.", "Added the proposed transaction effects.", "Used the adjusted EBITDA definition applied in the covenant package.", "Flagged the unverified equipment obligation instead of silently treating it as resolved."],
    whyHere: "Leverage shows how much debt sits on top of the company's earnings and how much cushion remains before the proposed maximum is reached.",
    presenterLine: "Post-deal leverage is 3.7 times EBITDA—inside the proposed limit, but with limited headroom and one debt-classification question still open.",
    sourceTrail: ["Debt schedule", "Q2 2026 financials", "Covenant package", "Draft credit agreement"],
    humanCheck: "A credit or legal reviewer must settle the equipment-obligation classification and confirm all EBITDA adjustments.",
  },
  {
    id: "source-readiness",
    category: "Evidence",
    title: "9 of 12 sources ready",
    shortLabel: "Source readiness",
    simple: "The AI used 12 documents, but only 9 are currently clear enough to rely on without another check. Three still need attention because something is missing, old, or uncertain.",
    professional: "Source readiness is a provenance control. A source is decision-ready only after extraction and review checks pass; attention items remain visible and can block final judgment when they affect a material conclusion.",
    aiSteps: ["Parsed each uploaded document and linked extracted facts to their page or table.", "Ran completeness, freshness, and consistency checks.", "Marked unresolved exceptions for analyst verification."],
    whyHere: "A polished calculation is not trustworthy if its supporting evidence is stale, incomplete, or misclassified.",
    presenterLine: "The interface distinguishes analysis from evidence quality: nine sources are ready, while three still need a human check.",
    sourceTrail: ["Document extraction status", "Source-review state", "Finding citations"],
    humanCheck: "Readiness means suitable for decision use under this workflow; it does not replace the analyst's responsibility to inspect material evidence.",
  },
  {
    id: "fixed-charge-coverage",
    category: "Repayment capacity",
    title: "Fixed-charge coverage: 1.41x",
    shortLabel: "1.41× coverage",
    simple: "This asks: after normal business costs, how much money is available for unavoidable payments such as loan payments, interest, and leases? At 1.41x, Meridian has roughly $1.41 available for every $1.00 of fixed payments under the bank's formula.",
    professional: "Fixed-charge coverage ratio compares defined cash flow available for fixed charges with the fixed charges due. The exact numerator and denominator follow the credit agreement and may adjust EBITDA for taxes, capital spending, distributions, interest, principal, and leases. Current coverage is 1.41x versus a proposed 1.20x minimum.",
    example: "1.41x leaves about $0.41 of calculated cushion for each $1.00 of required fixed payments—not 41% free cash in the bank account.",
    aiSteps: ["Extracted earnings and fixed-payment inputs from the financials and covenant package.", "Applied the defined coverage calculation.", "Reconciled the result to the reported 1.41x in the covenant package.", "Compared it with the proposed 1.20x minimum."],
    whyHere: "Coverage is the most direct summary of whether operating cash flow can absorb required payments and how much cushion exists if performance weakens.",
    presenterLine: "Today Meridian shows $1.41 of calculated payment capacity for each $1 due, against a proposed $1.20 minimum.",
    sourceTrail: ["Q2 2026 financials", "Covenant compliance package", "Draft credit agreement"],
    humanCheck: "The analyst must verify the bank-specific formula and every adjustment; coverage definitions vary across lenders and agreements.",
  },
  {
    id: "coverage-chart",
    category: "Repayment capacity",
    title: "Why we show the coverage chart",
    shortLabel: "Coverage chart",
    simple: "One number can hide the direction of travel. The line shows coverage falling from 1.72x to 1.41x. The expected case stays above the 1.20x safety line, but the weaker downside case falls to 1.12x. That is why the deal needs conditions instead of a simple green light.",
    professional: "The chart combines reported actuals with base and downside forecast paths and a proposed covenant floor. It exposes trend, forecast dependence, and covenant headroom: base-case coverage remains compliant, while downside coverage breaches the 1.20x floor by 0.08x at its low point.",
    aiSteps: ["Ordered reported quarterly coverage values from 1.72x to the current 1.41x.", "Mapped management's base forecast into the forward periods.", "Applied downside assumptions for margin and customer retention.", "Overlaid the proposed 1.20x minimum to make headroom visible."],
    whyHere: "The decision depends not only on today's 1.41x, but on whether coverage is deteriorating and how quickly the cushion disappears under stress.",
    presenterLine: "The chart earns its place because it shows the decision tension: compliant in the base case, below the floor in the downside.",
    sourceTrail: ["Historical financials", "Revenue and margin forecast", "Downside scenario", "Draft credit agreement"],
    humanCheck: "Forecast lines are scenarios, not facts. A human must judge whether management's assumptions and the downside severity are credible.",
  },
  {
    id: "review-priorities",
    category: "Human workflow",
    title: "Why these are the review priorities",
    shortLabel: "Review priorities",
    simple: "These are the three things most likely to change the credit decision: too much revenue depends on two customers, profits are getting thinner, and debt is rising. The table tells Alex what to investigate first—not what conclusion to choose.",
    professional: "The priority ledger converts material signals into adjudication work. Each row pairs a quantified signal with risk severity and workflow status so the analyst can verify evidence, challenge assumptions, and record judgment before recommendation.",
    aiSteps: ["Compared extracted values with trend, policy, and covenant reference points.", "Grouped related exceptions into three non-duplicative findings.", "Assigned an initial risk level and the next required workflow state.", "Linked every finding back to supporting sources."],
    whyHere: "Without prioritization, the analyst would have to search 12 documents and many calculations to discover which issues could actually affect the decision.",
    presenterLine: "The AI is reducing search cost: it turns a document package into three reviewable questions, each with evidence and a required human action.",
    sourceTrail: ["Finding engine", "Risk thresholds", "Workflow state", "Source citations"],
    humanCheck: "Risk labels are starting points. The analyst can retain, reduce, or escalate a risk after reviewing context and evidence.",
  },
  {
    id: "customer-concentration",
    category: "Review priority",
    title: "Customer concentration: 61%",
    shortLabel: "Customer concentration",
    simple: "Two customers generate 61% of Meridian's sales. If either one leaves or buys less, Meridian could lose a large part of the cash it needs to repay the bank.",
    professional: "Customer A represents 36% of net sales and Customer B 25%, for 61% top-two concentration versus the bank's 50% monitoring threshold. Contract duration changes near-term risk, but it does not remove structural concentration.",
    aiSteps: ["Read customer-level revenue from the concentration report.", "Calculated 36% plus 25% to get 61%.", "Compared the result with the 50% monitoring threshold.", "Flagged the original Customer A contract expiry as a material uncertainty."],
    whyHere: "Revenue concentration can cause a sudden cash-flow shock even when total sales currently look healthy.",
    presenterLine: "The issue is dependency: nearly two-thirds of revenue comes from two customers, so one lost relationship could materially weaken repayment.",
    sourceTrail: ["Customer concentration report", "Customer A supply agreement", "A/R aging", "Revenue forecast"],
    humanCheck: "The relationship team has a newer renewal agreement. A human must link and verify it, then rerun only the affected duration assumption.",
  },
  {
    id: "declining-margins",
    category: "Review priority",
    title: "Declining margins: 9.1%",
    shortLabel: "Declining margins",
    simple: "Meridian keeps less profit from each dollar of sales than before. Its operating margin fell from 14.2% to 9.1% because labor and ingredient costs rose faster than prices. Less profit means less room to make debt payments when something goes wrong.",
    professional: "EBITDA margin compressed 510 basis points from 14.2% to 9.1%. The base case assumes pricing and procurement actions restore part of the margin, but downside fixed-charge coverage falls to 1.12x, below the proposed floor.",
    aiSteps: ["Calculated EBITDA margin from historical financial statements.", "Measured the decline from 14.2% to 9.1%.", "Read management's pricing and procurement recovery assumptions.", "Propagated weaker recovery through the downside coverage case."],
    whyHere: "Margin erosion directly reduces the earnings and cash-flow cushion available for fixed payments.",
    presenterLine: "Sales may be growing, but the company is keeping less of each sales dollar; the key judgment is whether the promised margin recovery is believable.",
    sourceTrail: ["Q2 2026 financials", "Board-approved operating plan", "Revenue and margin forecast"],
    humanCheck: "A human should compare the plan with recent realized pricing, labor, and commodity costs rather than accepting management's forecast at face value.",
  },
  {
    id: "increasing-leverage",
    category: "Review priority",
    title: "Increasing leverage: 3.7x",
    shortLabel: "Increasing leverage",
    simple: "Meridian's debt is growing faster than its earnings cushion. The proposed deal puts debt at 3.7 times the earnings measure, leaving less space before the bank's 4.25x limit.",
    professional: "Pro forma total leverage rises from 3.2x reported to 3.7x after the transaction. It remains below the proposed 4.25x maximum, but the open classification of a $2.1 million equipment obligation could move leverage to approximately 3.9x and further reduce headroom.",
    aiSteps: ["Reconciled reported debt and EBITDA to the covenant package.", "Applied the proposed facility draw and transaction adjustments.", "Compared 3.7x with the 4.25x proposed maximum.", "Isolated the equipment obligation as an unresolved classification rather than burying it in the ratio."],
    whyHere: "Higher leverage makes the borrower more sensitive to earnings declines and can cause a covenant breach sooner under stress.",
    presenterLine: "The ratio is inside the proposed limit, but the cushion is not large and one classification decision could consume more of it.",
    sourceTrail: ["Debt schedule", "Q2 2026 financials", "Covenant package", "Draft credit agreement"],
    humanCheck: "The finding cannot be completed until the equipment obligation and the relevant debt definition are verified.",
  },
  {
    id: "findings-overview-story",
    category: "Findings overview",
    title: "How to read the findings workspace",
    shortLabel: "Findings overview",
    simple: "This page is the analyst's work queue for the few issues that could change the credit decision. The left side keeps open and completed items organized. The right side gives enough evidence to choose what to review next without pretending the preview is the final judgment.",
    professional: "The findings workspace is a master-detail adjudication ledger. It separates quantified risk from workflow status, groups unresolved and addressed findings, and preserves one selected evidence preview before the reviewer enters the full finding record.",
    aiSteps: ["Grouped related signals into non-duplicative findings.", "Calculated the initial risk band from thresholds and evidence confidence.", "Projected each finding's current workflow state from evidence, reassessment, and judgment records."],
    whyHere: "Reviewers need a scan-friendly queue that prioritizes work while keeping the underlying evidence and human decision boundary visible.",
    presenterLine: "This is not an AI alert feed; it is the analyst's organized queue of decision-relevant questions.",
    sourceTrail: ["Finding definitions", "Evidence state", "Analyst judgments"],
    humanCheck: "Select priority based on materiality, evidence quality, and decision timing—not simply the order in which findings appear.",
  },
  {
    id: "findings-ledger",
    category: "Findings overview",
    title: "Why risk and workflow status are separate",
    shortLabel: "Finding ledger",
    simple: "Material or Moderate tells you how serious the credit issue may be. Needs evidence, Needs judgment, or Addressed tells you what work remains. A serious issue can be fully reviewed, and a moderate issue can still be blocked by missing evidence.",
    professional: "Risk severity and workflow state are orthogonal dimensions. The ledger preserves that distinction so completion never implies low risk and severity never substitutes for an attributable disposition.",
    aiSteps: ["Estimated severity from the quantified exposure and policy reference point.", "Read the current evidence and analyst-action state separately.", "Displayed both dimensions on every row."],
    whyHere: "Combining severity and status into one badge would obscure whether the concern changed or only the review progressed.",
    presenterLine: "Risk answers how much the issue matters; status answers what the team still needs to do.",
    sourceTrail: ["Risk presentation", "Finding workflow state", "Judgment history"],
    humanCheck: "Do not treat Addressed as harmless. Read the recorded judgment to understand how the residual risk travels into the recommendation.",
  },
  {
    id: "findings-preview",
    category: "Findings overview",
    title: "What the selected preview is for",
    shortLabel: "Selected preview",
    simple: "The preview answers three quick questions: what changed, why it matters, and what the next action is. It is intentionally shorter than the full finding so the analyst can choose where to spend time.",
    professional: "The selected preview is a triage surface containing the current risk, workflow state, quantified artifact, decision relevance, provenance shortcut, and one contextual next action. It does not replace the focused adjudication record.",
    aiSteps: ["Selected the current display risk and analyst-owned conclusion when one exists.", "Compressed the strongest quantitative signal into a small artifact.", "Linked the preview to its cited sources and full review route."],
    whyHere: "A useful queue supports prioritization without forcing a reviewer to open every dossier.",
    presenterLine: "The preview provides just enough evidence to choose the next review action, then hands off to the full finding workspace.",
    sourceTrail: ["Current finding record", "Quantified signal", "Cited sources"],
    humanCheck: "Open the full finding before recording a judgment; the preview omits detailed assumptions and evidence exceptions.",
  },
  {
    id: "financials-story",
    category: "Financial assessment",
    title: "How to read the financial assessment",
    shortLabel: "Financial overview",
    simple: "This page turns the financial package into the three questions that matter most for this deal: are margins weakening, is debt rising, and is there enough cash-flow cushion for fixed payments? It separates reported history from forecast so estimates do not look like facts.",
    professional: "The financial assessment is a decision-oriented view of margin, leverage, and fixed-charge coverage. It combines reported actuals, forecast paths, covenant thresholds, scenario headroom, and sensitivity drivers while preserving links to related findings.",
    aiSteps: ["Normalized historical statements and forecast periods.", "Calculated the three credit metrics using the proposed facility structure.", "Compared the base and downside paths with covenant and monitoring thresholds."],
    whyHere: "A credit reviewer needs interpretation and headroom, not a generic dashboard of every available financial line item.",
    presenterLine: "The page is organized around repayment and covenant questions, with forecast uncertainty clearly separated from reported performance.",
    sourceTrail: ["Q2 2026 financials", "Management forecast", "Covenant package"],
    humanCheck: "Verify metric definitions and forecast assumptions before relying on the apparent headroom.",
  },
  {
    id: "financials-metrics",
    category: "Financial assessment",
    title: "Why these three financial signals are primary",
    shortLabel: "Financial signals",
    simple: "Margin shows how much earnings the business keeps, leverage shows how much debt those earnings support, and coverage shows whether cash flow can meet required payments. Selecting a card changes the question and chart below; it does not change the case record.",
    professional: "The metric strip is a selector for three linked underwriting lenses: operating profitability, balance-sheet leverage, and fixed-charge repayment capacity. Values and directional changes summarize the current state; the detailed trend supplies context.",
    aiSteps: ["Calculated each metric from normalized source values.", "Measured the current change against the relevant prior period.", "Connected each metric to the corresponding detailed series and finding."],
    whyHere: "These signals provide a compact entry point while avoiding a row of decorative KPIs with no decision use.",
    presenterLine: "Each card opens a different credit question: earnings quality, debt burden, or payment capacity.",
    sourceTrail: ["Financial statements", "Debt schedule", "Coverage calculation"],
    humanCheck: "A favorable current value can still hide a deteriorating trend or a weak downside case.",
  },
  {
    id: "financials-trend",
    category: "Financial assessment",
    title: "How actuals, forecasts, and thresholds work together",
    shortLabel: "Trend and threshold",
    simple: "The solid history shows what Meridian reported. The forecast area shows what management expects. A covenant line shows where the bank's protection begins. The important question is not only today's number, but how much cushion remains if the forecast is wrong.",
    professional: "The trend view distinguishes observed periods from forward projections and overlays the applicable leverage maximum or coverage minimum. Hover inspection exposes period values without replacing the narrative interpretation or threshold relationship.",
    aiSteps: ["Ordered the reported and forecast periods on one comparable series.", "Marked the forecast boundary explicitly.", "Applied the proposed covenant threshold and calculated directional headroom."],
    whyHere: "Credit risk often emerges through direction and shrinking headroom before a covenant is actually breached.",
    presenterLine: "The chart makes the uncertainty legible: actual performance, forecast dependence, and the covenant boundary are not blended together.",
    sourceTrail: ["Historical periods", "Forecast model", "Draft credit agreement"],
    humanCheck: "Treat forecast points as scenarios and challenge the assumptions that create the apparent recovery or stability.",
  },
  {
    id: "financials-scenarios",
    category: "Repayment capacity",
    title: "What base and downside coverage mean",
    shortLabel: "Coverage scenarios",
    simple: "The base case says Meridian can cover fixed payments by 1.41 times, above the 1.20 minimum. The downside falls to 1.12 times, below the minimum. That gap is why the recommendation needs monitoring and protections even though the expected case passes.",
    professional: "The scenario comparison expresses fixed-charge coverage headroom against the proposed 1.20x floor. Base-case headroom is +0.21x; the downside deficit is -0.08x, making covenant vulnerability explicit rather than hiding it inside a forecast model.",
    aiSteps: ["Applied the agreement-defined coverage formula to both scenarios.", "Compared each result with the proposed floor.", "Converted the difference into clear above-or-below headroom."],
    whyHere: "The decision depends on resilience under stress, not solely compliance in management's expected case.",
    presenterLine: "The base case supports proceeding, while the downside breach explains the need for conditions.",
    sourceTrail: ["Coverage model", "Downside assumptions", "Proposed covenant floor"],
    humanCheck: "Confirm that the downside is severe enough to be informative and that the formula matches the draft agreement.",
  },
  {
    id: "financials-drivers",
    category: "Financial assessment",
    title: "Why primary drivers are shown",
    shortLabel: "Primary drivers",
    simple: "These are the assumptions most likely to move the answer: pricing, commodity costs, customer retention, and the initial facility draw. They tell the analyst what to challenge instead of presenting the forecast as one unquestionable number.",
    professional: "The sensitivity list identifies the highest-impact modeled inputs affecting margin, leverage, and coverage. It converts an aggregate scenario output into reviewable operating and transaction assumptions.",
    aiSteps: ["Varied key assumptions within the scenario model.", "Measured which inputs moved coverage and leverage most.", "Ranked the drivers by decision sensitivity and linked them to the case evidence."],
    whyHere: "A reviewer can focus diligence on assumptions that materially change repayment capacity.",
    presenterLine: "The platform exposes what the forecast is most sensitive to, so the analyst can challenge the model rather than merely read it.",
    sourceTrail: ["Operating plan", "Sensitivity model", "Facility assumptions"],
    humanCheck: "Validate whether the selected drivers and tested ranges reflect the actual business and transaction risks.",
  },
  {
    id: "sources-story",
    category: "Source package",
    title: "How to read the source package",
    shortLabel: "Source overview",
    simple: "This is the evidence inventory behind the credit review. It shows which documents are ready to rely on and which still need a human check. A document can support calculations before it is fully verified, but unresolved evidence cannot be hidden at decision time.",
    professional: "The source index is the provenance and readiness ledger for the case. It separates document identity, reporting date, finding usage, and review state so evidence quality remains visible independently from analytical output.",
    aiSteps: ["Ingested and classified each case document.", "Linked extracted facts and findings back to their sources.", "Projected the latest source-review state from analyst verification and discrepancy actions."],
    whyHere: "A defensible credit conclusion requires a visible chain from decision back to source evidence.",
    presenterLine: "This page answers not only what documents exist, but whether each one is suitable for decision use.",
    sourceTrail: ["12 case documents", "Extraction links", "Review-state history"],
    humanCheck: "Prioritize sources that affect material findings, covenant calculations, or unresolved exceptions.",
  },
  {
    id: "sources-readiness",
    category: "Source package",
    title: "What Needs review and Ready mean",
    shortLabel: "Source readiness",
    simple: "Needs review means the source has an exception, an unresolved extraction, or has not been confirmed yet. Ready means the analyst has completed the required checks. Ready does not mean the document is true in every respect; it means it is suitable for this decision under the workflow.",
    professional: "Source readiness is a workflow control based on completeness, freshness, consistency, provenance, and analyst confirmation. It is not a generalized assurance opinion and does not eliminate professional skepticism.",
    aiSteps: ["Checked completeness and reporting date.", "Compared extracted values with related sources for conflicts.", "Applied the analyst's verified, pending, or flagged state."],
    whyHere: "The filters let reviewers isolate evidence exceptions without losing the full package context.",
    presenterLine: "Ready is a decision-use state, not a claim that the document has no business or accounting risk.",
    sourceTrail: ["Completeness checks", "Freshness checks", "Analyst verification"],
    humanCheck: "Inspect material exceptions directly; a status label is not a substitute for reading the cited evidence.",
  },
  {
    id: "sources-ledger",
    category: "Source package",
    title: "Why the source ledger shows usage",
    shortLabel: "Source ledger",
    simple: "Used in tells you how many findings depend on a document. That helps identify which evidence has the greatest effect on the case and where one correction could change several conclusions.",
    professional: "Finding usage expresses source-to-conclusion lineage. Combined with date, type, and review state, it helps the reviewer prioritize high-impact evidence and identify unlinked or stale artifacts.",
    aiSteps: ["Resolved citations from findings to source identifiers.", "Counted the distinct findings using each document.", "Kept unlinked documents visible rather than discarding them."],
    whyHere: "The ledger supports evidence triage and makes shared dependencies visible before the reviewer opens a document.",
    presenterLine: "The table shows where evidence matters, not just where it is stored.",
    sourceTrail: ["Source metadata", "Finding citations", "Review status"],
    humanCheck: "A heavily used source deserves extra scrutiny because one classification error can affect multiple conclusions.",
  },
  {
    id: "source-review-story",
    category: "Evidence review",
    title: "What this focused source review is doing",
    shortLabel: "Evidence review",
    simple: "The left side tells the analyst what was extracted and what needs confirmation. The right side keeps the actual document visible. The goal is to compare the summary with the evidence before the source can influence a credit decision.",
    professional: "The focused evidence workspace pairs a structured verification pane with the primary-source artifact. It preserves source navigation, exception state, extraction context, and one attributable completion action without opening a detached drawer.",
    aiSteps: ["Extracted candidate values and their context.", "Highlighted fields that affect findings or calculations.", "Placed the cited source beside the verification task for direct comparison."],
    whyHere: "Reviewers should not have to trust an extraction or switch between disconnected screens to verify it.",
    presenterLine: "The product keeps the claim and the source side by side so verification is fast and auditable.",
    sourceTrail: ["Selected source", "Extracted values", "Document artifact"],
    humanCheck: "Compare the displayed values with the source, including units, dates, definitions, and exceptions.",
  },
  {
    id: "source-verification",
    category: "Evidence review",
    title: "How extracted values should be reviewed",
    shortLabel: "Extracted values",
    simple: "These values are proposed readings from the document, not facts that bypass review. An alert marks a field where classification, freshness, or context could change the conclusion.",
    professional: "The verification card exposes field-level extraction, contextual meaning, and attention state. It is designed for reconciliation against the primary artifact before the source reaches verified status.",
    aiSteps: ["Located the relevant table, clause, or reported line item.", "Normalized the value and retained its source context.", "Flagged exceptions where another interpretation or document conflicts."],
    whyHere: "Field-level review is more precise than asking the analyst to approve an entire document as one opaque unit.",
    presenterLine: "The extraction accelerates review, but the analyst confirms the value and its meaning against the document.",
    sourceTrail: ["Document location", "Normalized value", "Exception check"],
    humanCheck: "Confirm the number, period, unit, and credit definition—not just whether the text looks similar.",
  },
  {
    id: "source-document",
    category: "Evidence review",
    title: "Why the source document stays visible",
    shortLabel: "Primary document",
    simple: "The document is the evidence of record. Zoom and paging help inspect it, but the platform does not rewrite the document or replace it with a summary.",
    professional: "The document stage preserves the primary artifact as read-only evidence beside the structured review. Highlighted content supports citation checking while maintaining the distinction between source, extraction, and interpretation.",
    aiSteps: ["Rendered the selected source in a consistent review stage.", "Mapped cited fields to visible document content.", "Kept document navigation synchronized with the selected source."],
    whyHere: "Direct evidence access reduces context switching and prevents summaries from becoming an untraceable source of truth.",
    presenterLine: "The right pane remains the primary record; the structured values on the left are only a review aid.",
    sourceTrail: ["Original source artifact", "Citation mapping", "Selected source state"],
    humanCheck: "Inspect surrounding clauses and footnotes when a value depends on definitions or exclusions.",
  },
  {
    id: "source-provenance",
    category: "Evidence review",
    title: "What source details and provenance provide",
    shortLabel: "Source provenance",
    simple: "Source details show when the document was produced, when it was reviewed, which findings use it, and the cited passage. This is the audit trail behind the extracted values.",
    professional: "The provenance disclosure preserves reporting date, review timestamp, format, assessment usage, citation text, and connected findings. It supports traceability without competing with the primary verification task.",
    aiSteps: ["Captured document metadata during intake.", "Resolved citations and connected findings.", "Updated the review timestamp after analyst action."],
    whyHere: "A reviewer needs to understand both the content and the lineage of decision evidence.",
    presenterLine: "The provenance record shows exactly where the evidence came from and where it is used.",
    sourceTrail: ["Document metadata", "Citation excerpt", "Finding links"],
    humanCheck: "Check that the reporting period and source authority are appropriate for the conclusion being supported.",
  },
  {
    id: "source-review-actions",
    category: "Evidence review",
    title: "What Confirm source and Flag a discrepancy do",
    shortLabel: "Evidence actions",
    simple: "Confirm source says the analyst checked the extraction and the document is ready for decision use. Flag a discrepancy blocks reliance until the issue is cleared. Neither action changes the underlying document.",
    professional: "The footer records an attributable source-review transition. Verification enables decision use; discrepancy status suspends readiness and creates follow-up work while retaining the original extraction and source record.",
    aiSteps: ["Preserves the existing source and extraction record.", "Applies the analyst-selected workflow state.", "Projects the change into source counts, findings, activity, and recommendation readiness where relevant."],
    whyHere: "The focused workspace ends with one explicit human-owned action rather than an ambiguous close gesture.",
    presenterLine: "The analyst either confirms the evidence for use or visibly blocks it for follow-up.",
    sourceTrail: ["Analyst identity", "Review-state event", "Activity history"],
    humanCheck: "Only confirm after reconciling material fields; describe and investigate real discrepancies instead of clearing them for convenience.",
  },
  {
    id: "activity-story",
    category: "Activity",
    title: "What the activity timeline represents",
    shortLabel: "Activity overview",
    simple: "This is the case's change history: what evidence arrived, what the system recalculated, what the analyst decided, and what senior credit recorded. It is ordered as a timeline so the reason for each change stays visible.",
    professional: "The activity view is an attributable event ledger spanning evidence, analysis, analyst actions, and decisions. It preserves sequence, actor, summary, and expandable detail rather than presenting a generic notification feed.",
    aiSteps: ["Collected workflow events from evidence, reassessment, judgment, recommendation, and decision actions.", "Assigned each event a semantic type and actor tone.", "Ordered the durable record for chronological review."],
    whyHere: "Reviewers need to reconstruct how the case moved from intake to decision and which evidence caused each conclusion change.",
    presenterLine: "The timeline tells the decision story in order, including both automated analysis and accountable human actions.",
    sourceTrail: ["Evidence events", "Analyst actions", "Decision records"],
    humanCheck: "Use the event detail and linked records when the summary alone is not enough to understand a material change.",
  },
  {
    id: "activity-filters",
    category: "Activity",
    title: "Why activity can be filtered by event type",
    shortLabel: "Activity filters",
    simple: "Filters answer different questions: Reassessments shows calculated changes, Analyst actions shows human judgment, Evidence shows document work, and Decisions shows recommendation or approval events. All activity remains the complete record.",
    professional: "Event-type filters provide scoped inspection of the immutable case history without changing its chronology or underlying records.",
    aiSteps: ["Classified each event by workflow source.", "Kept actor and tone metadata attached.", "Filtered the visible timeline while preserving the full event store."],
    whyHere: "A reviewer can isolate the part of the history relevant to an audit or handoff without losing the canonical complete view.",
    presenterLine: "Filters change the lens, not the record.",
    sourceTrail: ["Event type", "Actor", "Timestamp"],
    humanCheck: "Return to All activity before concluding that an event or dependency is absent.",
  },
  {
    id: "activity-timeline",
    category: "Activity",
    title: "How to read a timeline event",
    shortLabel: "Timeline events",
    simple: "The icon and line show the sequence. The title says what changed, the subtitle says when and why, and expanding the row shows the durable detail. Human and system actions remain visibly distinct.",
    professional: "Each timeline node carries semantic event presentation, chronology, concise causality, and expandable audit detail. Connected geometry communicates sequence without implying that every event has equal decision weight.",
    aiSteps: ["Mapped the workflow event to a semantic icon and tone.", "Generated a concise description from the recorded transition.", "Retained the full detail for expansion."],
    whyHere: "The compact default supports scanning, while expansion preserves the evidence needed for explanation and audit.",
    presenterLine: "Each node explains who or what changed the case and why that change matters.",
    sourceTrail: ["Workflow event", "Recorded detail", "Chronology"],
    humanCheck: "Read expanded detail for reassessments, escalations, returns, and final decisions before relying on the summary.",
  },
  {
    id: "recommendation-story",
    category: "Recommendation",
    title: "What the recommendation stage does",
    shortLabel: "Recommendation overview",
    simple: "The recommendation turns the completed review into one analyst-owned position for senior credit. The system can carry forward evidence and finding outcomes, but Alex chooses the posture, writes the rationale, and decides which protections to propose.",
    professional: "The recommendation stage converts adjudicated findings and reviewed evidence into an attributable analyst handoff. It preserves the distinction between system assessment, analyst recommendation, and senior decision.",
    aiSteps: ["Carried forward the resolved and escalated finding outcomes.", "Prepared the requested structure and reviewed evidence summary.", "Created a draft framework without selecting or submitting the analyst's position."],
    whyHere: "Senior credit needs a coherent decision story rather than a loose collection of findings and calculations.",
    presenterLine: "The platform assembles the record; the analyst authors and owns the recommendation.",
    sourceTrail: ["Finding outcomes", "Reviewed sources", "Analyst draft"],
    humanCheck: "Ensure the posture, amount, rationale, and conditions accurately reflect the completed review and residual risks.",
  },
  {
    id: "recommendation-readiness",
    category: "Recommendation",
    title: "How recommendation readiness works",
    shortLabel: "Recommendation readiness",
    simple: "Drafting unlocks only after every finding has an analyst disposition or an explicit escalation. Ready does not mean every risk disappeared; it means the case record is complete enough for Alex to make a recommendation.",
    professional: "Recommendation readiness is a workflow gate derived from attributable finding dispositions and required evidence controls. Escalated findings may remain material while still satisfying the gate because their unresolved senior judgment is explicit.",
    aiSteps: ["Checked each finding for an addressed or escalated state.", "Confirmed required evidence transitions were completed.", "Projected the resulting readiness and next action into the case route."],
    whyHere: "The gate prevents a polished recommendation from bypassing incomplete evidence or analyst work.",
    presenterLine: "Ready means the review is accountable and complete enough to hand off—not that the deal is risk-free.",
    sourceTrail: ["Finding workflow", "Evidence requirements", "Recommendation draft state"],
    humanCheck: "Review the escalated and revised findings before beginning; the gate validates completion, not the quality of the conclusion.",
  },
  {
    id: "recommendation-sections",
    category: "Recommendation",
    title: "Why the recommendation is split into four sections",
    shortLabel: "Recommendation steps",
    simple: "The four steps separate the decision into posture, facility structure, written rationale, and protections. Saving the current step lets Alex leave and resume without turning the form into one crowded page.",
    professional: "The guided authoring flow decomposes the analyst handoff into four durable draft sections. Section state and field values persist independently, supporting focused authorship and exact-position resume.",
    aiSteps: ["Initialized the draft from the reviewed case record.", "Stored the active section and latest field values.", "Kept navigation state separate from final submission."],
    whyHere: "Progressive authoring reduces cognitive load while preserving a complete, structured recommendation record.",
    presenterLine: "The workflow helps Alex build one recommendation in four deliberate decisions, with exact resume if interrupted.",
    sourceTrail: ["Draft section", "Autosaved fields", "Case record"],
    humanCheck: "Revisit earlier sections when a later rationale or condition reveals an inconsistency.",
  },
  {
    id: "recommendation-authoring",
    category: "Recommendation",
    title: "What the analyst is responsible for authoring",
    shortLabel: "Analyst authorship",
    simple: "Alex chooses whether to proceed, decline, or escalate; confirms the amount; explains the reasoning; and selects protections. Submitting creates a durable record under Alex's name and closes the draft.",
    professional: "The authoring surface captures the analyst posture, recommended structure, attributable rationale, and proposed conditions. Validation requires the fields relevant to the selected posture before an immutable submission event is created.",
    aiSteps: ["Suggested a structured set of available postures and controls.", "Carried forward case facts and current draft values.", "Prevented submission until required analyst-authored fields were complete."],
    whyHere: "The most consequential language and choices must remain explicit human work rather than a silent automated output.",
    presenterLine: "This is where the analyst moves from reviewing evidence to owning a recommendation.",
    sourceTrail: ["Analyst selections", "Human-authored rationale", "Selected conditions"],
    humanCheck: "Write a rationale that explains repayment, residual risks, and why the proposed protections are proportionate.",
  },
  {
    id: "recommendation-context",
    category: "Recommendation",
    title: "Why case context is available but secondary",
    shortLabel: "Case context",
    simple: "Case context keeps the resolved finding outcomes close when Alex needs to check them, but it stays closed by default so authoring remains the main task. Opening it does not reopen or change any finding.",
    professional: "The read-only context layer supplies finding outcomes and provenance within the focused task without duplicating the full case workspace or allowing hidden edits to adjudicated records.",
    aiSteps: ["Resolved the current analyst-owned outcome for each finding.", "Summarized the residual risk and status.", "Presented the record as read-only support beside the draft."],
    whyHere: "The analyst can verify the decision story without losing focus or navigating away from an in-progress draft.",
    presenterLine: "Supporting context is one action away, but it never competes with or silently changes the recommendation.",
    sourceTrail: ["Finding outcomes", "Analyst judgments", "Reviewed source count"],
    humanCheck: "Open the underlying finding or source if the summarized context is insufficient for a material recommendation claim.",
  },
  {
    id: "senior-decision-story",
    category: "Senior decision",
    title: "What the senior decision workspace is for",
    shortLabel: "Senior overview",
    simple: "Morgan receives the exact recommendation Alex submitted, the finding outcomes behind it, and a separate place to record the final decision. Morgan can approve, add final conditions, return the case for revision, or decline.",
    professional: "The senior workspace is a decision command center that preserves the immutable analyst recommendation, exposes residual and escalated findings, and records a distinct attributable senior outcome with validation appropriate to that outcome.",
    aiSteps: ["Projected the submitted analyst record without rewriting it.", "Carried forward finding outcomes and proposed protections.", "Prepared decision options and validation while preventing automated submission."],
    whyHere: "Governance requires the analyst recommendation and senior decision to remain separate, attributable records.",
    presenterLine: "Senior credit sees the same submitted case story and makes a distinct, accountable final decision.",
    sourceTrail: ["Submitted recommendation", "Finding outcomes", "Senior draft"],
    humanCheck: "Challenge the recommendation and inspect supporting evidence when a residual risk or proposed protection is not sufficiently explained.",
  },
  {
    id: "senior-recommendation",
    category: "Senior decision",
    title: "How to read the analyst recommendation",
    shortLabel: "Analyst record",
    simple: "This is Alex's submitted position, including the requested amount, rationale, and proposed conditions. Morgan can disagree, but cannot silently edit Alex's record; the senior decision is recorded separately.",
    professional: "The analyst recommendation is an immutable upstream record with authorship, timestamp, structure, rationale, and proposed protections. The senior workflow references it as decision evidence rather than treating it as an editable draft.",
    aiSteps: ["Loaded the submitted recommendation record.", "Preserved its author, timestamp, and exact content.", "Displayed it beside—but separate from—the senior decision form."],
    whyHere: "The final record must show what the analyst recommended and what senior credit ultimately decided.",
    presenterLine: "Morgan reviews Alex's recommendation as submitted; any difference appears transparently in the senior decision.",
    sourceTrail: ["Analyst recommendation", "Submission timestamp", "Proposed conditions"],
    humanCheck: "Confirm that the rationale addresses repayment capacity and every material or escalated finding.",
  },
  {
    id: "senior-findings",
    category: "Senior decision",
    title: "Why finding outcomes remain visible to senior credit",
    shortLabel: "Finding outcomes",
    simple: "The finding list shows what Alex accepted, revised, or escalated and the residual risk that remains. It gives Morgan a fast review path without hiding the underlying record or forcing every dossier open.",
    professional: "The senior outcome ledger compresses analyst dispositions, current risk, and escalation state into a decision scan. Escalations remain visually explicit and link back to the supporting case record.",
    aiSteps: ["Resolved the latest analyst judgment for each finding.", "Kept risk separate from workflow disposition.", "Elevated escalated outcomes for explicit senior attention."],
    whyHere: "Senior credit should understand which issues were resolved by analysis and which still require senior judgment.",
    presenterLine: "The ledger preserves the analyst's finding-level decisions and makes unresolved senior judgment impossible to miss.",
    sourceTrail: ["Finding judgments", "Risk presentation", "Escalation state"],
    humanCheck: "Open material or escalated findings when the compressed summary does not support the decision you are considering.",
  },
  {
    id: "senior-final-action",
    category: "Senior decision",
    title: "What each senior outcome records",
    shortLabel: "Final decision",
    simple: "Approve accepts the recommendation, Approve with conditions records final protections, Return to analyst asks Alex to revise while preserving both records, and Decline rejects the facility. Some outcomes require a note or at least one condition before submission.",
    professional: "The decision composer applies outcome-specific validation and creates an immutable senior record attributed to Morgan Lee. Return-to-analyst reopens a new analyst draft while preserving the prior recommendation and senior rationale in history.",
    aiSteps: ["Kept the senior selection in a separate draft state.", "Applied rationale and condition requirements based on the selected outcome.", "Projected the recorded outcome to analyst, senior, queue, drawer, bookmark, and activity views."],
    whyHere: "The final control makes decision ownership, requirements, and downstream workflow consequences explicit.",
    presenterLine: "Only Morgan can submit this decision, and every outcome creates a synchronized, attributable workflow record.",
    sourceTrail: ["Senior selection", "Decision note", "Workflow projection"],
    humanCheck: "Record enough rationale for another reviewer to understand the decision, especially for returns and declines.",
  },
  {
    id: "northstar-overview",
    category: "Northstar case",
    title: "How Northstar's prerequisite state works",
    shortLabel: "Northstar overview",
    simple: "Northstar starts with an evidence requirement, not a made-up finding. The missing 2027 forecast pauses the downside analysis until someone supplies and verifies it. After verification, the same workspace shows the updated result and the next human step.",
    professional: "Northstar models a prerequisite-gated credit review. Missing or unverified forecast evidence blocks affected analysis while preserving stable case navigation and an honest zero-findings state until a completed analysis produces an exception.",
    aiSteps: ["Detected that the approved source package ended before the needed downside period.", "Kept the affected calculation paused rather than extrapolating silently.", "Projected request, evidence, analysis, and recommendation stages from the durable workflow state."],
    whyHere: "A clean prerequisite state prevents missing evidence from being misrepresented as a credit finding or a false green result.",
    presenterLine: "Northstar shows the work required before a conclusion can be trusted, then carries the verified result through the same case flow.",
    sourceTrail: ["Approved source package", "2027 forecast requirement", "Workflow state"],
    humanCheck: "Supply, verify, and reconcile the forecast before relying on the updated coverage result.",
  },
  {
    id: "northstar-findings",
    category: "Northstar case",
    title: "Why Northstar can show zero findings",
    shortLabel: "Northstar findings",
    simple: "Before the forecast is verified, the missing document is a requirement—not a finding. After the verified downside case clears the policy floor, the page can honestly say there are zero findings that require judgment.",
    professional: "Northstar's findings state distinguishes an evidence prerequisite from a completed analysis with no decision-relevant exception. The verified state carries coverage, floor, and headroom so zero findings remains evidenced rather than decorative.",
    aiSteps: ["Held findings generation until material evidence was verified.", "Calculated the verified downside result once the forecast arrived.", "Reported either the prerequisite or the zero-findings outcome with the relevant facts."],
    whyHere: "The distinction prevents teams from treating missing evidence as risk or treating an unfinished analysis as cleared.",
    presenterLine: "Zero findings means the completed analysis found no exception requiring judgment; it never means evidence was skipped.",
    sourceTrail: ["Forecast verification", "Downside coverage", "Findings state"],
    humanCheck: "Confirm that the completed analysis scope covers the material risks before treating zero findings as decision-ready.",
  },
  {
    id: "northstar-financials",
    category: "Northstar case",
    title: "How Northstar financials move from blocked to reviewed",
    shortLabel: "Northstar financials",
    simple: "Financials first show the known period, the missing 2027 downside period, and the 1.20x policy floor. Once the forecast is verified, the page shows 1.29x coverage and asks Alex to confirm the analysis before recommendation.",
    professional: "The Northstar financial surface exposes the evidence-gated comparison and then a separate analyst analysis-review transition. Verification updates the calculation; analyst sign-off advances the case to recommendation.",
    aiSteps: ["Preserved the known actual coverage.", "Blocked the missing downside period with an explicit requirement.", "Applied the verified forecast and exposed the result for analyst sign-off."],
    whyHere: "The page separates automated recalculation from the human confirmation needed before a recommendation can be prepared.",
    presenterLine: "The result can update after evidence verification, but Alex still owns the analysis review before the case advances.",
    sourceTrail: ["Known actuals", "Verified forecast", "Policy floor", "Analyst sign-off"],
    humanCheck: "Check the verified inputs, result, and policy comparison before completing analysis review.",
  },
  {
    id: "northstar-sources",
    category: "Northstar case",
    title: "What Northstar's Sources tab tracks",
    shortLabel: "Northstar sources",
    simple: "The Sources tab tracks the one document that unlocks the affected analysis, how it arrived, and which verification state it is in. Uploading, processing, and verifying are separate steps.",
    professional: "Northstar's source surface is a requirement ledger tied to request provenance, processing state, verification, and downstream analysis. It keeps document intake distinct from analytical completion.",
    aiSteps: ["Created a requirement for the 2027 Operating Forecast.", "Tracked borrower or analyst supply and processing outcome.", "Projected verification into financials and findings only after explicit confirmation."],
    whyHere: "A single missing source can block one analysis path without making the whole case unreadable.",
    presenterLine: "The requirement ledger tells us exactly what is missing, who supplied it, and what work remains before it can be used.",
    sourceTrail: ["Document request", "File provenance", "Verification state"],
    humanCheck: "Inspect the forecast and its assumptions before marking it verified.",
  },
  {
    id: "northstar-activity",
    category: "Northstar case",
    title: "How Northstar activity explains the evidence journey",
    shortLabel: "Northstar activity",
    simple: "Activity follows the forecast from request to receipt, extraction, verification, analyst review, recommendation, and decision. Each state is recorded separately so nobody mistakes an upload for a completed analysis.",
    professional: "The Northstar event ledger preserves evidence intake, processing, verification, analysis review, recommendation, and senior decision transitions as distinct attributable records.",
    aiSteps: ["Recorded each workflow transition with its actor and timestamp.", "Kept processing outcomes separate from verification and analysis review.", "Displayed the sequence as an expandable timeline."],
    whyHere: "The timeline explains why the case is blocked or ready and gives the next reviewer a complete handoff history.",
    presenterLine: "Northstar's activity view makes the evidence lifecycle explicit from request through decision.",
    sourceTrail: ["Request history", "Processing history", "Verification and decision events"],
    humanCheck: "Use the event detail to reconcile who completed each step and whether the analysis actually advanced.",
  },
  {
    id: "northstar-recommendation",
    category: "Northstar case",
    title: "When Northstar can enter recommendation",
    shortLabel: "Northstar recommendation",
    simple: "Northstar can move to recommendation only after the forecast is verified and Alex confirms the updated analysis. The recommendation then uses the verified 1.29x downside result instead of a placeholder.",
    professional: "Northstar recommendation readiness depends on verified prerequisite evidence and completed analyst analysis review. The resulting handoff carries the updated coverage result and preserves prior intake and verification events.",
    aiSteps: ["Checked prerequisite evidence state.", "Exposed the recalculated result for analyst review.", "Unlocked recommendation after explicit analysis completion."],
    whyHere: "Recommendation should not be a shortcut around missing evidence or unreviewed recalculation.",
    presenterLine: "The recommendation opens only when the evidence and updated analysis have crossed their human checkpoints.",
    sourceTrail: ["Verified forecast", "Analysis review", "Recommendation record"],
    humanCheck: "Ensure the recommendation reflects the verified downside case and any remaining monitoring requirements.",
  },
  {
    id: "standard-overview",
    category: "Standard credit review",
    title: "How a standard case fits the shared review model",
    shortLabel: "Standard overview",
    simple: "Standard cases use the same case header, tabs, findings, sources, activity, and recommendation journey. Their facts and current workflow state differ, but the geometry and human ownership stay familiar.",
    professional: "The standard workspace is the shared multi-case contract: object header, section tabs, evidence-linked findings, attributable activity, and recommendation handoff with company-specific data and status.",
    aiSteps: ["Loaded the standard review record and current AI workflow state.", "Mapped findings, sources, and recommendation facts into shared geometry.", "Kept case-specific evidence and status in the owning review data."],
    whyHere: "Consistency lets an analyst transfer knowledge between Meridian, Northstar, and ordinary cases without relearning the product.",
    presenterLine: "The case changes; the mental model does not.",
    sourceTrail: ["Standard review record", "Shared tab contract", "Case-specific findings"],
    humanCheck: "Use the company-specific evidence and status rather than assuming every case has Meridian's workflow stage.",
  },
  {
    id: "standard-findings",
    category: "Standard credit review",
    title: "How to work standard findings",
    shortLabel: "Standard findings",
    simple: "The standard Findings tab uses the same selected-ledger geometry: choose a finding, inspect the preview, open its evidence, then mark your review or move into the decision flow. Layout options are preserved for design history, not as daily task controls.",
    professional: "Standard findings share the current selected-ledger/master-detail contract with explicit risk, workflow status, citations, and analyst review state. Historical layout variants remain addressable through Design Tools.",
    aiSteps: ["Grouped the case's findings by workflow state.", "Projected current risk and analyst review status separately.", "Linked each finding to source and decision actions."],
    whyHere: "A stable findings interaction prevents page-specific layout modes from becoming part of the user's cognitive burden.",
    presenterLine: "Every case uses the same finding review rhythm while retaining its own material questions and evidence.",
    sourceTrail: ["Finding list", "Selected preview", "Source citations"],
    humanCheck: "Review the finding evidence and rationale before marking it reviewed or carrying it into a recommendation.",
  },
  {
    id: "standard-sources",
    category: "Standard credit review",
    title: "What standard sources provide",
    shortLabel: "Standard sources",
    simple: "Sources show the documents behind the case and which findings use them. Opening a source keeps the evidence close to the relevant review instead of making the analyst search another system.",
    professional: "The standard source surface provides document identity, provenance, connected findings, and read-only inspection within the shared evidence contract.",
    aiSteps: ["Loaded source metadata and citations from the case record.", "Connected each document to findings and activity.", "Kept source inspection separate from analyst judgment."],
    whyHere: "Traceable evidence is a baseline expectation across every case, not a Meridian-only enhancement.",
    presenterLine: "The source trail should feel familiar no matter which borrower is under review.",
    sourceTrail: ["Source package", "Finding citations", "Evidence view"],
    humanCheck: "Confirm source date, relevance, and context before accepting the associated conclusion.",
  },
  {
    id: "standard-activity",
    category: "Standard credit review",
    title: "How standard activity preserves accountability",
    shortLabel: "Standard activity",
    simple: "Activity shows document work, analyst review, recommendation, and decision changes in one attributable history. It is the same interaction model as the richer cases, even when the standard record has fewer events.",
    professional: "The standard activity ledger follows the shared event presentation and chronology contract, allowing cross-case audit and handoff without a separate notification model.",
    aiSteps: ["Collected case activity entries.", "Mapped event type and actor presentation.", "Kept expandable detail available for audit."],
    whyHere: "Consistent activity semantics reduce ambiguity when a case moves between analysts or senior reviewers.",
    presenterLine: "Every case tells its story through the same attributable event language.",
    sourceTrail: ["Case activity", "Actor metadata", "Decision history"],
    humanCheck: "Use the expanded event detail when a status or recommendation change needs explanation.",
  },
  {
    id: "standard-recommendation",
    category: "Standard credit review",
    title: "How standard recommendation hands off",
    shortLabel: "Standard recommendation",
    simple: "After the analyst reviews the standard case, the recommendation captures the posture, rationale, and protections for senior credit. It remains a human-owned handoff even when the case is simpler than Meridian.",
    professional: "The standard recommendation surface preserves analyst authorship, case facts, findings, conditions, and senior handoff semantics in the shared decision contract.",
    aiSteps: ["Summarized the standard case record and findings.", "Prepared recommendation context and next actions.", "Kept submission and final decision as separate attributable events."],
    whyHere: "A simple case still needs a clear boundary between analysis, recommendation, and approval.",
    presenterLine: "The recommendation is the analyst's interpretation of the evidence, not an automated verdict.",
    sourceTrail: ["Standard findings", "Analyst rationale", "Senior handoff"],
    humanCheck: "Make sure the recommendation explains the residual risk and any conditions that senior credit needs to own.",
  },
  {
    id: "queue-overview",
    category: "Credit review queue",
    title: "How to read the credit reviews queue",
    shortLabel: "Queue overview",
    simple: "The queue is the portfolio entry point. It groups your reviews, lets you search and filter them, and opens a preview before you enter a full case. Each row shows one status based on who owns the next important action.",
    professional: "The queue is a live case ledger with scoped tabs, search/filter controls, selected-row state, an outcome-led preview rail, and a dominant-next-action lifecycle projected from case state.",
    aiSteps: ["Loaded the case list and current workflow state.", "Projected evidence, finding, recommendation, and decision ownership into one case status.", "Prepared a preview that separates prerequisites, findings, and next action."],
    whyHere: "Reviewers need a fast portfolio scan before committing to a full case workspace.",
    presenterLine: "The queue tells you what needs attention and why, then opens the same case record used by the analyst.",
    sourceTrail: ["Review record", "Workflow projection", "Selected preview"],
    humanCheck: "Use the preview for triage; open the full case before making or relying on a material judgment.",
  },
  {
    id: "queue-statuses",
    category: "Credit review queue",
    title: "What each case status means",
    shortLabel: "Case statuses",
    simple: "Needs verification means missing or unreliable evidence blocks the case. Analyst review means the evidence is usable and Alex must interpret it. Ready to recommend means the required findings are addressed. Awaiting decision means Morgan now owns the next action. Revision requested means Morgan returned the case to Alex. Approved and Declined are final outcomes. Change events stay inside the preview, case, and activity history instead of competing with the row status.",
    professional: "The queue uses one case-level lifecycle derived from the dominant accountable next action: Needs verification, Analyst review, Ready to recommend, Awaiting decision, Revision requested, then Approved or Declined. Analysis ready and Analysis updated are system events, so they appear in contextual detail rather than beside the lifecycle status.",
    example: "Meridian is Analyst review because Alex can continue interpreting the case despite one verification item. Northstar is Needs verification because the missing 2027 forecast blocks the downside analysis. Atlas is Ready to recommend because Alex has completed its last finding review.",
    aiSteps: ["Checked whether an evidence gap blocks meaningful analysis.", "Checked whether the analyst, senior credit, or no one owns the next action.", "Projected one lifecycle status and kept finding counts and update events inside the case or preview."],
    whyHere: "A queue status should answer what the reviewer needs to do now. It should not summarize every finding or repeat a system event.",
    presenterLine: "We use one case status based on the dominant next action: AI events stay secondary, while the queue makes human ownership clear.",
    sourceTrail: ["Evidence requirements", "Finding dispositions", "Recommendation state", "Senior decision record"],
    humanCheck: "Open the preview when a case has mixed finding states; the row intentionally shows only the dominant case-level action.",
  },
  {
    id: "queue-filters",
    category: "Credit review queue",
    title: "What queue scope, search, and filters change",
    shortLabel: "Queue filters",
    simple: "My reviews and All reviews change the set of rows you are scanning. Search and filters narrow that set without changing any underlying case or workflow state.",
    professional: "Queue controls alter the visible projection only. Scope, query, due-date, facility, and ownership filters remain view state and do not mutate case records.",
    aiSteps: ["Applied the selected scope and filter predicates to the live review list.", "Kept workflow status derived from persisted case state.", "Preserved selected-row and drawer continuity when filters change."],
    whyHere: "Filtering should reduce search cost without creating a second, stale source of truth.",
    presenterLine: "The queue controls change what you see, not what the case means.",
    sourceTrail: ["Scope tabs", "Search query", "Filter state"],
    humanCheck: "Clear filters before concluding a review is absent from the portfolio.",
  },
  {
    id: "queue-preview",
    category: "Credit review queue",
    title: "What the selected review preview is for",
    shortLabel: "Queue preview",
    simple: "The preview gives you the company, request, review outcome, evidence prerequisite, finding summary, and one next action. It is a confident handoff into the case—not a place to complete the credit review.",
    professional: "The current outcome-led rail is a responsive triage surface. It preserves queue context, projects live finding/evidence state, and exposes a single contextual CTA into the full workflow.",
    aiSteps: ["Resolved the selected company's current state.", "Composed evidence prerequisite and finding rows from the case workflow.", "Chose the next action based on readiness and actor ownership."],
    whyHere: "A queue preview should help a reviewer decide whether to open the case without duplicating the full case workspace.",
    presenterLine: "The rail is the bridge between portfolio scan and full review.",
    sourceTrail: ["Selected review", "Outcome projection", "Next action"],
    humanCheck: "Treat the preview as orientation and triage; the full case remains the decision record.",
  },
  {
    id: "senior-queue-overview",
    category: "Senior queue",
    title: "How the senior decision queue differs",
    shortLabel: "Senior queue overview",
    simple: "Senior credit starts from submitted recommendations, not raw intake. The queue groups cases needing review, waiting on analyst revision, and already decided, while keeping the original analyst handoff visible.",
    professional: "The senior queue is an actor-specific submission ledger with stage tabs, search, selected handoff preview, and projections for ready, waiting, and decided states.",
    aiSteps: ["Loaded submitted analyst recommendations and senior decisions.", "Projected return-to-analyst and revision states into the correct stage.", "Provided a senior-focused preview with decision context and protections."],
    whyHere: "Senior reviewers need a decision-ready queue, not the analyst's evidence intake worklist.",
    presenterLine: "The senior queue begins where the analyst handoff ends and keeps revision loops visible.",
    sourceTrail: ["Analyst recommendation", "Senior decision state", "Queue stage"],
    humanCheck: "Open the submitted case record when the handoff summary does not answer the decision question.",
  },
  {
    id: "senior-queue-filters",
    category: "Senior queue",
    title: "What the senior queue stages mean",
    shortLabel: "Senior queue stages",
    simple: "Needs review means a recommendation is ready for Morgan. Waiting on analyst means Morgan returned it and Alex is revising. Decided means a final senior outcome exists. These stages describe ownership and next work, not risk level.",
    professional: "Senior queue stages are workflow ownership projections derived from recommendation and decision history. They remain independent from finding severity and outcome labels.",
    aiSteps: ["Read the latest recommendation and senior decision records.", "Applied return-loop logic to the waiting stage.", "Kept decided records separate from in-progress revisions."],
    whyHere: "The queue should make the next accountable actor obvious after a handoff or return.",
    presenterLine: "Senior stages answer who acts next, while the case record answers why.",
    sourceTrail: ["Senior stage", "Decision history", "Revision state"],
    humanCheck: "Inspect the return rationale and draft state before assuming a returned case is complete.",
  },
  {
    id: "senior-queue-preview",
    category: "Senior queue",
    title: "What the senior handoff preview emphasizes",
    shortLabel: "Senior preview",
    simple: "The senior preview leads with the analyst recommendation, facility, decision focus, key protections, and the next senior action. It keeps the underlying evidence available without repeating the entire analyst workspace.",
    professional: "The senior rail is a handoff-oriented preview that surfaces recommendation posture, exposure, decision question, finding summary, proposed conditions, and actor-specific CTA.",
    aiSteps: ["Resolved the submitted recommendation and current senior stage.", "Compressed findings and protections into decision context.", "Selected open, view, or analyst-case action from the projected stage."],
    whyHere: "A senior reviewer needs decision context first, with the detailed analyst evidence one deliberate action away.",
    presenterLine: "The preview respects senior attention: posture and decision focus first, deep evidence when needed.",
    sourceTrail: ["Submitted handoff", "Decision focus", "Proposed protections"],
    humanCheck: "Open the full senior review before submitting approval, return, or decline.",
  },
  {
    id: "overview-command-center",
    category: "Workspace overview",
    title: "How the workspace overview helps you choose work",
    shortLabel: "Overview command center",
    simple: "The overview is a triage page. It shows portfolio movement, your workload, and the reviews most useful to pick up next. It points you into the case queue; it is not a second review workspace.",
    professional: "The overview aggregates portfolio status, analyst workload, and priority review projections into navigable summaries. It is an operational entry point, not an independent source of credit truth.",
    aiSteps: ["Projected live review records into portfolio counts.", "Ranked assigned cases by workflow attention and due timing.", "Linked summary actions to the canonical credit-review queue."],
    whyHere: "Analysts need to decide what to open next before they invest in a full case review.",
    presenterLine: "The overview tells Alex where attention is needed, then hands the work to the same queue and case records used everywhere else.",
    sourceTrail: ["Portfolio review records", "Workload projection", "Priority queue"],
    humanCheck: "Use the linked queue and case workspace before relying on a summary count or status.",
  },
  {
    id: "overview-workload",
    category: "Workspace overview",
    title: "What workload and activity summaries mean",
    shortLabel: "Workload and activity",
    simple: "The workload cards and activity list help you prioritize. They do not change a case, make a judgment, or replace the case's evidence and audit trail.",
    professional: "Workload and activity components are read-only projections of review ownership, due timing, and workflow state. Their navigation targets canonical review routes.",
    aiSteps: ["Grouped assigned reviews by attention and due timing.", "Applied the selected activity view to the current review list.", "Kept every summary action linked to the underlying case record."],
    whyHere: "A compact operational summary reduces search cost without creating a parallel workflow state.",
    presenterLine: "This page helps us choose the next case; the case workspace remains where evidence and judgment live.",
    sourceTrail: ["Assigned reviews", "Due-date groups", "Review activity projection"],
    humanCheck: "Open the underlying case when a summary status would affect a material action.",
  },
  {
    id: "intelligence-workflow",
    category: "Credit intelligence",
    title: "How Intelligence works through a question",
    shortLabel: "Intelligence workflow",
    simple: "Intelligence scopes your question, reads approved context, reconciles the relevant analysis, and prepares a briefing. The visible work trace makes those steps clear while the answer is being prepared.",
    professional: "The Intelligence workflow separates prompt scoping, approved-source retrieval, analytical reconciliation, and response synthesis. The work trace communicates process state without implying autonomous decision authority.",
    aiSteps: ["Resolved the requested review, finding, or portfolio context.", "Read only the selected approved sources or model scenarios.", "Reconciled the relevant assessment and prepared a decision-oriented response."],
    whyHere: "People need to understand what the assistant is doing and what it is not allowed to decide.",
    presenterLine: "Intelligence accelerates evidence synthesis, but the work trace and guardrail keep recommendation and approval ownership with people.",
    sourceTrail: ["Selected contexts", "Approved source set", "Generated work trace"],
    humanCheck: "Check cited sources and carry any conclusion into the canonical review before using it in a recommendation.",
  },
  {
    id: "intelligence-answer",
    category: "Credit intelligence",
    title: "How to use an Intelligence answer",
    shortLabel: "Answer and evidence",
    simple: "An answer summarizes what changed, what still matters, and which sources support it. Open the source or linked finding to verify the claim before using it in credit work.",
    professional: "The answer surface distinguishes synthesized interpretation, risk context, source excerpts, and navigation into the underlying finding or financial analysis. It is decision support, not an approval artifact.",
    aiSteps: ["Summarized the selected evidence and model output.", "Separated changed facts from residual risk.", "Exposed source links and canonical review destinations for verification."],
    whyHere: "A useful answer should shorten the path to evidence while preserving a clear verification boundary.",
    presenterLine: "The answer is a starting brief: the evidence and case route remain the record of truth.",
    sourceTrail: ["Answer sources", "Finding detail", "Financial analysis"],
    humanCheck: "Verify the cited evidence, assumptions, and date before copying language into a credit note.",
  },
  {
    id: "reimbursements-ledger",
    category: "Reimbursements",
    title: "How the reimbursements ledger is organized",
    shortLabel: "Expense ledger",
    simple: "The ledger shows expenses, their status, amount, category, receipt, and policy state. Select a row when you need the full request and its timeline.",
    professional: "The reimbursements ledger is the canonical list surface for expense requests, supporting scope tabs, status/category filters, selection, and a detail drawer for review actions.",
    aiSteps: ["Loaded expense records and their policy metadata.", "Applied the selected scope and filters to the visible list.", "Kept detail actions in the selected expense drawer."],
    whyHere: "Reviewers need a dense, scannable list before opening a specific reimbursement.",
    presenterLine: "The ledger is for scanning and selecting; the drawer is where one expense gets reviewed.",
    sourceTrail: ["Expense records", "Policy metadata", "Selected expense"],
    humanCheck: "Open the expense detail before approving, declining, or relying on a policy status.",
  },
  {
    id: "reimbursements-filters",
    category: "Reimbursements",
    title: "What reimbursement filters change",
    shortLabel: "Expense filters",
    simple: "Scope, status, and category filters change which expenses are visible. They do not alter the requests themselves or approve anything.",
    professional: "Reimbursement controls are view-state predicates over the expense collection. Bulk selection and status actions remain separate, explicit mutations.",
    aiSteps: ["Applied scope, quick status, and category predicates.", "Recomputed visible and selected totals.", "Kept bulk actions explicit and attributable."],
    whyHere: "Filtering should make review faster without hiding what action will change state.",
    presenterLine: "Filters narrow the list; only an explicit review or bulk action changes an expense.",
    sourceTrail: ["Scope tabs", "Status filter", "Category filter"],
    humanCheck: "Clear or review active filters before concluding an expense is absent.",
  },
  {
    id: "reimbursements-drawer",
    category: "Reimbursements",
    title: "What the reimbursement drawer is for",
    shortLabel: "Expense detail",
    simple: "The drawer gathers the receipt, policy checks, submitter, timeline, and next action for one expense. It keeps context visible while you decide what to do.",
    professional: "The detail drawer is an actor-focused review surface combining expense facts, receipt/provenance, policy evaluation, activity timeline, and explicit approval or decline actions.",
    aiSteps: ["Resolved the selected expense and current status.", "Presented receipt and policy context together.", "Exposed the next valid action for the reviewer."],
    whyHere: "A reviewer should not have to leave the ledger to understand one request or its audit trail.",
    presenterLine: "The drawer turns one row into a complete, attributable review without losing the list context.",
    sourceTrail: ["Expense record", "Receipt", "Policy checks", "Activity timeline"],
    humanCheck: "Confirm receipt and policy details before recording an approval or decline.",
  },
  {
    id: "finding-page-story",
    category: "Finding review",
    title: "How to read this finding",
    shortLabel: "Finding overview",
    simple: "This page turns one concern into a reviewable story. Start with the risk rating and the visual signal, check what new evidence could change the view, inspect how the conclusion was built, then record a human judgment.",
    professional: "The focused finding view separates the system's initial risk classification, the quantified risk signal, scoped evidence updates, assessment basis, source provenance, and analyst-owned disposition. It is an adjudication workspace rather than a static finding report.",
    aiSteps: ["Grouped related customer and contract signals into one finding.", "Assigned the current risk band from the evidence available at assessment time.", "Linked each assessment input to its source and evidence type.", "Identified the exact evidence that can trigger a scoped reassessment."],
    whyHere: "A reviewer can understand the concern, why it matters, what could change it, and which human action comes next without leaving the finding.",
    presenterLine: "This page is the decision workspace for one finding: system analysis first, then evidence, then accountable human judgment.",
    sourceTrail: ["Customer concentration report", "Customer A agreement", "Finding workflow state"],
    humanCheck: "The system frames and updates the finding. The analyst still decides whether to accept, revise, or escalate the conclusion.",
  },
  {
    id: "finding-initial-assessment",
    category: "Risk rating",
    title: "Initial assessment and rating scale",
    shortLabel: "Initial assessment",
    simple: "There are two ratings in this finding workflow: Material and Moderate. Material means the issue could meaningfully change repayment or the credit decision. Moderate means the issue still matters, but the current evidence shows less immediate impact. This is a starting rating—not the final decision.",
    professional: "The finding taxonomy currently uses two initial risk bands: Material and Moderate. Meridian's customer concentration begins as Material because 61% top-two exposure exceeds the 50% monitoring threshold and the original Customer A contract had limited remaining duration. Verified renewal evidence can reduce near-term risk to Moderate without removing structural concentration.",
    example: "Material = decision-changing exposure. Moderate = meaningful exposure with more support or protection.",
    aiSteps: ["Calculated 61% top-two revenue concentration.", "Compared it with the 50% monitoring threshold.", "Checked the duration of the Customer A agreement in the original source set.", "Combined severity and evidence confidence into the initial risk band."],
    whyHere: "The rating gives the reviewer a fast sense of severity, while the adjacent facts and visual show exactly what produced it.",
    presenterLine: "The two-level risk scale is intentionally simple: Material or Moderate, with the reasoning and evidence always visible beside the label.",
    sourceTrail: ["Customer concentration report", "Customer A supply agreement", "50% monitoring threshold"],
    humanCheck: "The analyst should challenge the rating when verified evidence or business context materially changes the exposure.",
  },
  {
    id: "finding-evidence-update",
    category: "Evidence update",
    title: "Why the renewal is called out",
    shortLabel: "Evidence update",
    simple: "A newer Customer A renewal may change how risky the relationship looks. The platform highlights it because it arrived after the first assessment. A person must verify the document before the AI can update only this finding.",
    professional: "The matched renewal is post-assessment evidence. Selecting it does not silently replace the original source or revise the decision. The workflow requires provenance and material-term verification, then runs a scoped reassessment limited to contract duration and the affected risk band.",
    aiSteps: ["Detected a newer agreement associated with Customer A.", "Matched it to the open contract-duration assumption.", "Held it outside the assessment until analyst verification.", "Prepared a scoped reassessment that preserves unrelated findings."],
    whyHere: "New evidence is placed beside the current assessment so the reviewer can see both the original basis and the possible update without losing the audit trail.",
    presenterLine: "The platform found a newer renewal, but it will not change the rating until an analyst verifies the source and runs the scoped update.",
    sourceTrail: ["Customer A renewal agreement", "Original Customer A agreement", "Evidence intake record"],
    humanCheck: "Confirm the counterparty, execution status, effective dates, and minimum-purchase terms before reassessment.",
  },
  {
    id: "finding-assessment-basis",
    category: "Reasoning",
    title: "How the assessment was built",
    shortLabel: "Assessment basis",
    simple: "The rows separate three kinds of input: facts copied from verified sources, interpretations of what those sources mean, and assumptions used in a model. Keeping them separate shows which parts are firm and which parts need judgment.",
    professional: "The basis ledger exposes provenance at the statement level. Verified facts, source interpretations, and modeled assumptions carry different confidence and review obligations, preventing calculated output from appearing equally certain across all inputs.",
    aiSteps: ["Extracted the concentration values as source-backed facts.", "Interpreted contract duration and customer dependency.", "Applied modeled downside assumptions where observed data was unavailable.", "Labeled each basis item by evidence type for review."],
    whyHere: "A reviewer can challenge the weakest part of the reasoning directly instead of accepting or rejecting an opaque conclusion.",
    presenterLine: "The assessment is explainable at the input level: fact, interpretation, and modeled assumption are never presented as the same thing.",
    sourceTrail: ["Extracted facts", "Contract interpretation", "Downside model"],
    humanCheck: "Verify the facts, confirm the interpretation, and decide whether the modeled assumptions are conservative enough.",
  },
  {
    id: "finding-source-set",
    category: "Evidence",
    title: "Evidence reviewed",
    shortLabel: "Source set",
    simple: "These are the documents behind the finding. Each row shows the source and whether it is ready to rely on. Opening a source lets the analyst check the exact evidence instead of trusting the summary alone.",
    professional: "The source ledger preserves finding-to-document provenance and review state. It enables reviewers to move from conclusion to cited artifact while retaining the finding context and the distinction between extracted, verified, and attention-needed evidence.",
    aiSteps: ["Linked every material statement to a source document.", "Recorded the source date and review state.", "Kept original and newer evidence distinguishable in the audit trail."],
    whyHere: "The assessment remains auditable and a reviewer can inspect the primary evidence without searching the full case package.",
    presenterLine: "Every conclusion can be traced back to the document that supports it and the current review status of that document.",
    sourceTrail: ["Concentration report", "Customer agreements", "A/R aging", "Revenue forecast"],
    humanCheck: "Open and inspect any source that materially affects the rating before recording judgment.",
  },
  {
    id: "finding-judgment",
    category: "Human decision",
    title: "What happens at Record judgment",
    shortLabel: "Human judgment",
    simple: "This is where the analyst takes responsibility. Accept uses the system's conclusion, Revise records a different analyst conclusion, and Escalate sends the concern forward for senior attention. Every choice requires a written reason.",
    professional: "The judgment action creates an attributable disposition separate from the read-only system assessment. Accept preserves the conclusion for recommendation drafting, Revise records an analyst-owned interpretation, and Escalate carries the finding into senior review. Rationale and evidence links are retained in Activity.",
    aiSteps: ["Preserves the system assessment as a read-only record.", "Attaches the selected disposition and rationale to the analyst identity.", "Links any verified reassessment evidence to the judgment.", "Updates finding completion and recommendation readiness."],
    whyHere: "The sticky action keeps the required next step visible after the analyst has reviewed the full page.",
    presenterLine: "The AI can propose and update a view; this final control is where a named analyst owns what the organization will do with it.",
    sourceTrail: ["System assessment", "Verified evidence", "Analyst rationale", "Activity record"],
    humanCheck: "Choose the disposition deliberately and explain the evidence and reasoning that support it.",
  },
];

export const overviewLearningTopicIds: MeridianLearningTopicId[] = [
  "overview-command-center", "overview-workload",
];

export const meridianWalkthroughTopicIds: MeridianLearningTopicId[] = [
  "walkthrough-start",
  "walkthrough-intake",
  "walkthrough-repayment",
  "walkthrough-assessment",
  "walkthrough-findings",
  "walkthrough-progress",
  "walkthrough-recommendation",
  "walkthrough-decision",
];

export const findingLearningTopicIds: MeridianLearningTopicId[] = [
  "finding-page-story", "finding-initial-assessment", "finding-evidence-update", "finding-assessment-basis", "finding-source-set", "finding-judgment",
];

export const findingsOverviewLearningTopicIds: MeridianLearningTopicId[] = [
  "findings-overview-story", "case-header", "review-navigation", "findings-ledger", "findings-preview",
];

export const financialsLearningTopicIds: MeridianLearningTopicId[] = [
  "financials-story", "case-header", "review-navigation", "financials-metrics", "financials-trend", "financials-scenarios", "financials-drivers",
];

export const sourcesIndexLearningTopicIds: MeridianLearningTopicId[] = [
  "sources-story", "case-header", "review-navigation", "sources-readiness", "sources-ledger",
];

export const sourceReviewLearningTopicIds: MeridianLearningTopicId[] = [
  "source-review-story", "source-verification", "source-document", "source-provenance", "source-review-actions",
];

export const activityLearningTopicIds: MeridianLearningTopicId[] = [
  "activity-story", "case-header", "review-navigation", "activity-filters", "activity-timeline",
];

export const recommendationLearningTopicIds: MeridianLearningTopicId[] = [
  "recommendation-story", "case-header", "review-navigation", "recommendation-readiness", "recommendation-context",
];

export const recommendationDraftLearningTopicIds: MeridianLearningTopicId[] = [
  "recommendation-story", "recommendation-readiness", "recommendation-sections", "recommendation-authoring", "recommendation-context",
];

export const seniorDecisionLearningTopicIds: MeridianLearningTopicId[] = [
  "senior-decision-story", "case-header", "review-navigation", "senior-recommendation", "senior-findings", "senior-final-action",
];

export const platformLearningTopicIdsByScope: Record<PlatformLearningScope, MeridianLearningTopicId[]> = {
  "northstar-overview": ["northstar-overview", "case-header", "review-navigation"],
  "northstar-findings": ["northstar-findings", "case-header", "review-navigation"],
  "northstar-financials": ["northstar-financials", "case-header", "review-navigation"],
  "northstar-sources": ["northstar-sources", "case-header", "review-navigation"],
  "northstar-activity": ["northstar-activity", "case-header", "review-navigation"],
  "northstar-recommendation": ["northstar-recommendation", "case-header", "review-navigation"],
  "standard-overview": ["standard-overview", "case-header", "review-navigation"],
  "standard-findings": ["standard-findings", "case-header", "review-navigation"],
  "standard-sources": ["standard-sources", "case-header", "review-navigation"],
  "standard-activity": ["standard-activity", "case-header", "review-navigation"],
  "standard-recommendation": ["standard-recommendation", "case-header", "review-navigation"],
  queue: ["queue-overview", "queue-statuses", "queue-filters", "queue-preview"],
  "senior-queue": ["senior-queue-overview", "senior-queue-filters", "senior-queue-preview"],
  overview: ["overview-command-center", "overview-workload"],
  intelligence: ["intelligence-workflow", "intelligence-answer"],
  reimbursements: ["reimbursements-ledger", "reimbursements-filters", "reimbursements-drawer"],
};

export const meridianLearningTopicIdsByScope: Record<MeridianLearningScope, MeridianLearningTopicId[]> = {
  "workspace-overview": overviewLearningTopicIds,
  walkthrough: meridianWalkthroughTopicIds,
  "findings-overview": findingsOverviewLearningTopicIds,
  finding: findingLearningTopicIds,
  financials: financialsLearningTopicIds,
  "sources-index": sourcesIndexLearningTopicIds,
  "source-review": sourceReviewLearningTopicIds,
  activity: activityLearningTopicIds,
  recommendation: recommendationLearningTopicIds,
  "recommendation-draft": recommendationDraftLearningTopicIds,
  "senior-decision": seniorDecisionLearningTopicIds,
  "senior-review": seniorDecisionLearningTopicIds,
};

export function firstLearningTopicForScope(scope: MeridianLearningScope) {
  return meridianLearningTopicIdsByScope[scope][0];
}

export const meridianLearningTopicById = Object.fromEntries(
  meridianLearningTopics.map((topic) => [topic.id, topic]),
) as Record<MeridianLearningTopicId, MeridianLearningTopic>;
