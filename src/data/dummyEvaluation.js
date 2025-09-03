export const dummyEvaluation = {
  finalOutcome: "YES",
  steps: [
    {
      step: "Step 1: Plan Asset Rule",
      passed: true,
      evidences: [
        {
          page_number: 342,
          text: "Each original or subsequent purchaser or transferee of a Note will be deemed to represent that either (i) it is not purchasing or holding such Notes (or any interest in such Notes) with the assets of a Plan or a governmental, church, non-U.S. or other plan that is subject to Similar Laws or (ii) its acquisition, holding and disposition of such Notes will not constitute or result in (A) a prohibited transaction under Section 406 of ERISA or Section 4975 of the Code..."
        }
      ]
    },
    {
      step: "Step 2: Operating Company Exception",
      passed: true,
      evidences: [
        {
          page_number: 342,
          text: "The Issuer considers itself to qualify, and intends to operate so as to continue to qualify, as an “operating company” under ERISA, although no assurances are provided that such determination will be respected..."
        }
      ]
    },
    {
      step: "Step 3: ERISA Disclaimer",
      passed: true,
      evidences: [
        {
          page_number: 357,
          text: "Each purchaser and holder of the Notes has exclusive responsibility for ensuring that its purchase, holding and/or disposition of the Notes does not violate the fiduciary or prohibited transaction rules of ERISA, Section 4975 of the Code or any Similar Laws..."
        }
      ]
    }
  ]
};
