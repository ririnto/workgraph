export const meta = {
  description:
    "Adaptive delivery graph: stop on evidence or deliver a reviewed change",
  name: "adaptive-delivery",
  phases: [
    { detail: "separate the goal into disjoint scopes", title: "Scope" },
    { detail: "one read-only explorer per scope", title: "Explore" },
    {
      detail: "decide whether to stop or define disjoint work units",
      title: "Plan"
    },
    {
      detail: "one isolated implementation agent per unit",
      title: "Implement"
    },
    {
      detail: "merge named unit branches only for split work",
      title: "Integrate"
    },
    { detail: "diff-only environment-exposure sweep", title: "Sweep" },
    { detail: "create or update the PR or MR", title: "Publish" },
    { detail: "independent review of the complete change", title: "Review" }
  ]
};

// Dispatch settings
const variant = "delivery";
const maxScopes = 4;
const unitCap = 4;
const defaultFixRounds = 1;
const phaseTitles = {
  scope: "Scope",
  explore: "Explore",
  plan: "Plan",
  implement: "Implement",
  integrate: "Integrate",
  sweep: "Sweep",
  publish: "Publish",
  review: "Review"
};
const phaseKeys = Object.keys(phaseTitles);
const input =
  args === null || typeof args !== "object" || Array.isArray(args) ? {} : args;
if (typeof input.task !== "string" || !input.task.trim()) {
  throw new Error("Provide the delivery goal as a nonempty args.task string");
}
const task = input.task;
if (
  input.issue !== undefined &&
  (typeof input.issue !== "string" || !input.issue.trim())
) {
  throw new Error(
    "Provide args.issue as a nonempty issue reference when supplied"
  );
}
const issue = input.issue?.trim() ?? "";
const baseBranch =
  typeof input.baseBranch === "string" ? input.baseBranch.trim() : "";
const candidateBranch =
  typeof input.candidateBranch === "string" ? input.candidateBranch.trim() : "";
const repository =
  typeof input.repository === "string" ? input.repository.trim() : "";
const settingsMap = (value, name) => {
  if (value === undefined || value === null) {
    return {};
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Provide ${name} as an object keyed by phase`);
  }
  return value;
};
const skipped = settingsMap(input.skips, "args.skips");
const needsBase = skipped.implement !== true || baseBranch !== "";
const models = settingsMap(input.models, "args.models");
const efforts = settingsMap(input.efforts, "args.efforts");
const promptParts = settingsMap(input.promptParts, "args.promptParts");
for (const map of [skipped, models, efforts, promptParts]) {
  for (const key of Object.keys(map)) {
    if (!phaseKeys.includes(key)) {
      throw new Error(
        `Unknown phase key ${key}; supported phases are ${phaseKeys.join(", ")}`
      );
    }
  }
}
const defaultModels = {
  explore: "haiku",
  plan: "sonnet",
  integrate: "sonnet",
  sweep: "haiku",
  publish: "haiku"
};
for (const key of phaseKeys) {
  const skip = skipped[key];
  if (skip !== undefined && typeof skip !== "boolean") {
    throw new Error(`Provide skips.${key} as a boolean`);
  }
  const model = models[key];
  if (model !== undefined && (typeof model !== "string" || !model.trim())) {
    throw new Error(
      `Provide models.${key} as a nonempty model selector string`
    );
  }
  const effort = efforts[key];
  if (effort !== undefined && (typeof effort !== "string" || !effort.trim())) {
    throw new Error(`Provide efforts.${key} as a nonempty effort string`);
  }
  const part = promptParts[key];
  if (part !== undefined && (typeof part !== "string" || !part.trim())) {
    throw new Error(
      `Provide promptParts.${key} as a nonempty instruction string`
    );
  }
}
const maxFixRounds =
  input.maxFixRounds === undefined ? defaultFixRounds : input.maxFixRounds;
if (
  !Number.isSafeInteger(maxFixRounds) ||
  maxFixRounds < 0 ||
  maxFixRounds > 3
) {
  throw new Error("Provide maxFixRounds as an integer from 0 through 3");
}
const compose = (...parts) => parts.filter((part) => part?.trim()).join("\n\n");

// Graph contracts and dispatch
const graph = { nodes: [], edges: [] };
const activeNodes = Object.fromEntries(phaseKeys.map((key) => [key, key]));
const phaseRecords = {};
const operations = {
  scope: [
    "Separate disjoint scopes",
    "delivery scope owner",
    "read-only",
    ["task"],
    ["baseBranch", "scopes", "evidence", "source"]
  ],
  explore: [
    "Join scope exploration results",
    "workflow coordinator",
    "accept evidence only",
    ["scopes", "scopeAttempts"],
    ["explorations"]
  ],
  plan: [
    "Decide whether implementation is needed",
    "delivery planner",
    "read-only",
    ["scopes", "explorations"],
    ["units", "evidence", "optional stopReason"]
  ],
  implement: [
    "Join implementation results",
    "workflow coordinator",
    "accept evidence only",
    ["units", "unitAttempts"],
    ["unitResults", "attemptResources"]
  ],
  integrate: [
    "Merge named unit branches",
    "integration owner",
    "merge named branches; check combined candidate; no push",
    ["destination", "destinationStart", "baseBranch", "unitResources"],
    ["branch", "startCommit", "commit", "checks", "resources"]
  ],
  sweep: [
    "Scan the named candidate for exposures",
    "exposure explorer",
    "read-only",
    ["baseBranch", "candidate"],
    ["commit", "baseCommit", "coverage", "exposures", "evidence"]
  ],
  publish: [
    "Publish the named candidate",
    "publication owner",
    "publish authorized PR/MR; no merge",
    [
      "repository",
      "candidate",
      "baseBranch",
      "baseCommit",
      "checks",
      "priorUrl",
      "issue"
    ],
    [
      "url",
      "repository",
      "headBranch",
      "baseBranch",
      "commit",
      "baseCommit",
      "action",
      "evidence"
    ]
  ],
  review: [
    "Independently review the posted candidate",
    "independent reviewer",
    "read-only",
    ["publication", "candidate", "checks"],
    ["commit", "baseCommit", "coverage", "verdict", "findings", "evidence"]
  ]
};
for (const key of phaseKeys) {
  const [operation, owner, authority, inputs, outputs] = operations[key];
  graph.nodes.push({
    key,
    operation,
    prerequisites: [],
    inputs,
    outputs,
    owner,
    authority,
    completionEvidence: [],
    status: "pending",
    reason: null
  });
}
connect("scope", "explore");
connect("scope", "plan");
connect("explore", "plan", "condition", "!skips.explore");
connect("plan", "implement");
connect("implement", "integrate");
connect("plan", "integrate", "condition", "units.length > 1");
connect("implement", "sweep");
connect(
  "integrate",
  "sweep",
  "condition",
  "units.length > 1 || skips.integrate"
);
connect("implement", "publish");
connect(
  "integrate",
  "publish",
  "condition",
  "units.length > 1 || skips.integrate"
);
connect("sweep", "publish");
connect("publish", "review");
nodeFor("scope").inputs = {
  task,
  baseBranch,
  suppliedScope: input.scope !== undefined
};

// Shared prompt context
const taskPart = `Delivery goal: ${task}`;
const basePart = baseBranch
  ? `Base branch: ${baseBranch}`
  : "Base branch: the repository default branch";
const issuePart = issue ? `Linked issue reference: ${issue}` : "";
const readOnlyPart =
  "This stage is read-only, so change nothing and publish nothing.";

// Delivery decisions
phase("Scope");
const { scopes, resolvedBase, checkoutParts } = await separateScopes();
const canonicalPath = (path) => relativePath(path, checkoutParts);

phase("Explore");
const explorations = await exploreScopes();
const scopePathsResolved =
  checkoutParts !== null ||
  scopes.every((scope) => scope.paths.every((path) => !isExternal(path)));
const noWorkInScope = (item) =>
  typeof item.stopReason === "string" &&
  item.stopReason.trim() &&
  item.risks.length === 0;
if (
  scopePathsResolved &&
  explorations.length > 0 &&
  explorations.length === scopes.length &&
  explorations.every(noWorkInScope)
) {
  const evidence = explorations.map(({ key, stopReason, evidence }) => ({
    key,
    reason: stopReason,
    evidence
  }));
  return stopAfter(
    "explore",
    "Every scope reported that no work remains.",
    evidence
  );
}

phase("Plan");
const plan = await planDelivery();
if (plan?.stopReason) {
  return stopAfter("plan", plan.stopReason, [
    { key: "plan", evidence: plan.evidence }
  ]);
}
const units = plan?.units ?? [];
const externalUnits = units.filter((unit) => unit.paths.some(isExternal));
if (externalUnits.length > 0) {
  const reason =
    "Continue external work at its owning location before claiming Git delivery.";
  const evidence = externalUnits.map(({ key, paths }) => ({
    key,
    paths,
    evidence: plan.evidence
  }));
  return stopAfter("plan", reason, evidence, { kind: "handoff", units });
}
const split = units.length > 1;
if (units.length > 0) {
  log(
    split
      ? "The plan split the work into parallel units"
      : "The plan defined a single work unit"
  );
}

phase("Implement");
let unitResults = [];
const attemptLedger = [];
if (incompletePredecessor("implement") !== undefined) {
  recordPhase(
    "implement",
    "skipped",
    "Required Plan predecessor is incomplete"
  );
} else if (skipped.implement) {
  recordPhase(
    "implement",
    "skipped",
    "Explicit dispatch skip, so source changes did not run"
  );
} else if (!candidateBranch) {
  recordPhase(
    "implement",
    "failed",
    "Provide the named task candidate as a nonempty args.candidateBranch string, because implementation cannot verify a worktree starting reference without it"
  );
} else if (candidateBranch === resolvedBase) {
  recordPhase(
    "implement",
    "failed",
    "The task candidate cannot equal the base branch"
  );
} else {
  log(
    split
      ? "Implementing the planned units in parallel"
      : "Implementing the planned unit"
  );
  const implementState = await dispatchImplementation(
    units,
    null,
    "",
    candidateBranch,
    null
  );
  recordPhase(
    "implement",
    implementState.status,
    implementState.reason,
    implementState
  );
  unitResults = implementState.unitResults;
  retainAttempts(implementState.attemptResources, attemptLedger);
}

phase("Integrate");
let integrationState;
if (incompletePredecessor("integrate") !== undefined) {
  integrationState = {
    reason: "Implementation did not complete",
    status: "skipped"
  };
} else if (skipped.integrate) {
  integrationState = {
    reason: "Explicit dispatch skip, so worktree integration did not run",
    status: "skipped"
  };
} else if (
  graph.edges.some(
    (edge) =>
      edge.to === activeNodes.integrate &&
      edge.type === "condition" &&
      !edgeRequired(edge)
  )
) {
  integrationState = {
    branch: unitResults[0].branch,
    reason:
      "The plan defines a single work unit, so no cross-unit integration is required",
    status: "skipped"
  };
} else {
  log("Integrating the named unit branches into the task branch");
  integrationState = await dispatchIntegration(
    unitResults,
    candidateBranch,
    unitResults[0].startCommit
  );
}
recordPhase(
  "integrate",
  integrationState.status,
  integrationState.reason,
  integrationState
);
applyLedger(integrationState, attemptLedger);
let candidate = acceptedCandidate(integrationState);

phase("Sweep");
let sweepState;
if (incompletePredecessor("sweep") !== undefined) {
  sweepState = {
    reason: `Required ${phaseTitles[incompletePredecessor("sweep")]} predecessor is incomplete`,
    status: "skipped"
  };
} else if (skipped.sweep) {
  sweepState = {
    reason: "Explicit dispatch skip, so the exposure sweep did not run",
    status: "skipped"
  };
} else {
  log("Sweeping the change for environment exposures");
  sweepState = await dispatchSweep(candidate);
}
recordPhase("sweep", sweepState.status, sweepState.reason, sweepState);

phase("Publish");
let postedUrl = null;
let publishState = await runPublish(
  sweepState,
  unitResults,
  integrationState,
  candidate,
  null
);
recordPhase("publish", publishState.status, publishState.reason, publishState);
if (publishState.status === "completed") {
  postedUrl = publishState.url;
}

phase("Review");
let reviewState;
if (skipped.review) {
  reviewState = {
    reason: "Explicit dispatch skip, so independent review did not run",
    status: "skipped"
  };
} else if (incompletePredecessor("review") !== undefined) {
  reviewState = {
    reason:
      "Required Publish predecessor is incomplete, so there is no posted request to review",
    status: "skipped"
  };
} else {
  log("Reviewing the posted candidate");
  reviewState = await dispatchReview(
    unitResults,
    integrationState,
    candidate,
    publishState,
    0
  );
}
recordPhase("review", reviewState.status, reviewState.reason, reviewState);

// Repair only the owners of blocking findings, then review the updated request.
const reviewHistory = [reviewState];
let roundsUsed = 0;
while (
  reviewState.status === "completed" &&
  reviewState.verdict === "fix-required" &&
  roundsUsed < maxFixRounds &&
  !skipped.implement &&
  phaseRecords.plan.status === "completed"
) {
  const verificationKey = `verify-findings:${roundsUsed + 1}`;
  const verification = await verifyFindings(
    verificationKey,
    reviewState,
    candidate,
    publishState
  );
  reviewState = { ...reviewState, verification };
  reviewHistory[roundsUsed] = reviewState;
  if (verification.status !== "completed") {
    reviewState = {
      ...reviewState,
      reason: verification.reason,
      status: "failed"
    };
    recordPhase("review", reviewState.status, reviewState.reason, reviewState);
    break;
  }
  const confirmed = verification.confirmed;
  if (confirmed.length === 0) {
    recordPhase(
      "review",
      "completed",
      "Independent verification refuted every finding",
      reviewState
    );
    break;
  }
  const unmatched = confirmed.filter(
    (finding) =>
      units.filter((unit) =>
        unit.paths.some((path) => ownsPath(path, finding.file))
      ).length !== 1
  );
  if (unmatched.length > 0) {
    reviewState = {
      ...reviewState,
      reason: "Confirmed findings do not map to exactly one owned unit",
      status: "failed"
    };
    recordPhase("review", reviewState.status, reviewState.reason, reviewState);
    break;
  }
  const targets = units.filter((unit) =>
    confirmed.some((finding) =>
      unit.paths.some((path) => ownsPath(path, finding.file))
    )
  );
  roundsUsed += 1;
  const repairBase = candidate;
  for (const key of ["implement", "integrate", "sweep", "publish", "review"]) {
    const previous = nodeFor(activeNodes[key]);
    activeNodes[key] = `${key}:fix-${roundsUsed}`;
    graph.nodes.push({
      ...previous,
      key: activeNodes[key],
      prerequisites: [],
      inputs: operations[key][3],
      status: "pending",
      reason: null,
      completionEvidence: []
    });
  }
  connect("plan", activeNodes.implement);
  connect(verificationKey, activeNodes.implement);
  connect(activeNodes.implement, activeNodes.integrate);
  connect("plan", activeNodes.integrate);
  connect(activeNodes.implement, activeNodes.sweep);
  connect(activeNodes.integrate, activeNodes.sweep);
  connect(activeNodes.implement, activeNodes.publish);
  connect(activeNodes.integrate, activeNodes.publish);
  connect(activeNodes.sweep, activeNodes.publish);
  connect(activeNodes.publish, activeNodes.review);
  phase("Implement");
  const fixState = await dispatchImplementation(
    targets,
    confirmed,
    `:fix-${roundsUsed}`,
    repairBase.branch,
    verificationKey
  );
  recordPhase("implement", fixState.status, fixState.reason, fixState);
  retainAttempts(fixState.attemptResources, attemptLedger);
  const repairedByKey = new Map(
    fixState.unitResults.map((unit) => [unit.key, unit])
  );
  unitResults = unitResults.map((unit) => repairedByKey.get(unit.key) ?? unit);
  if (fixState.status !== "completed") {
    integrationState = {
      reason: "Implementation did not complete",
      status: "skipped"
    };
    sweepState = {
      reason: "Required Integration predecessor is incomplete",
      status: "skipped"
    };
    publishState = {
      reason: "Implementation did not complete, so publication is blocked",
      status: "skipped"
    };
    reviewState = {
      reason:
        "Required Publish predecessor is incomplete, so there is no posted request to review",
      status: "skipped"
    };
    for (const [key, state] of Object.entries({
      integrate: integrationState,
      sweep: sweepState,
      publish: publishState,
      review: reviewState
    })) {
      recordPhase(key, state.status, state.reason, state);
    }
    break;
  }
  phase("Integrate");
  integrationState = skipped.integrate
    ? {
        reason: "Explicit dispatch skip, so worktree integration did not run",
        status: "skipped"
      }
    : await dispatchIntegration(
        unitResults,
        repairBase.branch,
        repairBase.commit
      );
  recordPhase(
    "integrate",
    integrationState.status,
    integrationState.reason,
    integrationState
  );
  applyLedger(integrationState, attemptLedger);
  candidate = acceptedCandidate(integrationState);
  phase("Sweep");
  sweepState =
    incompletePredecessor("sweep") !== undefined
      ? {
          reason: `Required ${phaseTitles[incompletePredecessor("sweep")]} predecessor is incomplete`,
          status: "skipped"
        }
      : skipped.sweep
        ? {
            reason: "Explicit dispatch skip, so the exposure sweep did not run",
            status: "skipped"
          }
        : await dispatchSweep(candidate);
  recordPhase("sweep", sweepState.status, sweepState.reason, sweepState);
  phase("Publish");
  publishState = await runPublish(
    sweepState,
    unitResults,
    integrationState,
    candidate,
    postedUrl
  );
  recordPhase(
    "publish",
    publishState.status,
    publishState.reason,
    publishState
  );
  if (publishState.status === "completed") {
    postedUrl = publishState.url;
  }
  phase("Review");
  reviewState =
    incompletePredecessor("review") === undefined
      ? await dispatchReview(
          unitResults,
          integrationState,
          candidate,
          publishState,
          roundsUsed
        )
      : {
          reason:
            "Required Publish predecessor is incomplete, so there is no posted request to review",
          status: "skipped"
        };
  reviewHistory.push(reviewState);
  recordPhase("review", reviewState.status, reviewState.reason, reviewState);
}
if (
  reviewState.status === "completed" &&
  reviewState.verdict === "fix-required" &&
  reviewState.verification?.confirmed?.length !== 0
) {
  recordPhase(
    "review",
    "completed",
    `Verdict fix-required after ${roundsUsed} of ${maxFixRounds} fix rounds`,
    reviewState
  );
}
for (const node of graph.nodes) {
  if (node.status === "running") {
    setOutcome(
      node.key,
      "failed",
      "The dispatched node returned no accepted result"
    );
  } else if (node.status === "pending") {
    setOutcome(
      node.key,
      "skipped",
      "A required predecessor or dispatch skip prevented this node from running"
    );
  }
}
const complete =
  phaseKeys.every(
    (key) =>
      nodeFor(activeNodes[key]).status === "completed" ||
      (key === "explore" &&
        skipped.explore &&
        nodeFor(activeNodes[key]).status === "skipped") ||
      (nodeFor(activeNodes[key]).status === "skipped" &&
        !skipped[key] &&
        graph.edges.some(
          (edge) =>
            edge.to === activeNodes[key] &&
            edge.type === "condition" &&
            !edgeRequired(edge)
        ) &&
        incompletePredecessor(key) === undefined)
  ) &&
  (reviewState.verdict === "pass" ||
    reviewState.verification?.confirmed?.length === 0);
return finish({
  complete,
  units,
  unitResults,
  resources: attemptLedger,
  roundsUsed,
  reviewHistory,
  integration: integrationState,
  review: reviewState,
  sweep: sweepState,
  publish:
    postedUrl === null
      ? null
      : {
          url: postedUrl,
          ...(nodeFor(activeNodes.publish).status === "completed"
            ? { action: publishState.action, evidence: publishState.evidence }
            : {})
        }
});

// Both terminal paths return the same graph and result shape.
function stopAfter(
  key,
  reason,
  evidence,
  { kind = "no-change", units = [] } = {}
) {
  const earlyExit = { kind, phase: phaseTitles[key], reason, evidence };
  const skippedStage = {
    status: "skipped",
    reason: `${earlyExit.phase}: ${reason}`
  };
  for (const remaining of phaseKeys.slice(phaseKeys.indexOf(key) + 1)) {
    recordPhase(remaining, skippedStage.status, skippedStage.reason);
  }
  return finish({
    complete: kind === "no-change",
    earlyExit,
    units,
    integration: skippedStage,
    review: skippedStage
  });
}

function finish({
  complete,
  integration,
  review,
  earlyExit = null,
  publish = null,
  sweep = null,
  units = [],
  unitResults = [],
  resources = [],
  roundsUsed = 0,
  reviewHistory = []
}) {
  const phaseEvidence = phaseKeys.map((key) => phaseRecords[key]);
  if (phaseEvidence.some((record) => record?.status === undefined)) {
    throw new Error("Phase evidence is incomplete");
  }
  return {
    complete,
    earlyExit,
    graph: {
      nodes: graph.nodes,
      edges: graph.edges.map((edge) => ({
        ...edge,
        required: edgeRequired(edge)
      }))
    },
    phaseEvidence,
    scopes,
    explorations,
    variant,
    split: units.length > 1,
    units: units.map((unit) => ({
      branch:
        unitResults.find((result) => result.key === unit.key)?.branch ?? null,
      key: unit.key,
      paths: unit.paths
    })),
    resources,
    integration,
    publish,
    review,
    reviewHistory,
    exposures: sweep?.exposures ?? [],
    sweepEvidence: sweep?.evidence ?? null,
    fixRounds: { max: maxFixRounds, used: roundsUsed }
  };
}

// Phase implementations
async function separateScopes() {
  const supplied = input.scope !== undefined;
  if (!supplied && skipped.scope) {
    recordPhase(
      "scope",
      "skipped",
      "Scope dispatch was skipped without a supplied scope"
    );
    return { scopes: [], resolvedBase: "", checkoutParts: null };
  }
  const scopeAttempt = supplied
    ? { result: input.scope }
    : await dispatchScope();
  const scopeList = Array.isArray(scopeAttempt.result?.scopes)
    ? scopeAttempt.result.scopes
    : [];
  const checkout = scopeAttempt.result?.checkoutRoot;
  const root =
    typeof checkout === "string" ? checkout.trim().replace(/\\/g, "/") : "";
  const absoluteRoot = /^(?:[A-Za-z]:\/|\/)/.test(root);
  const checkoutParts = absoluteRoot
    ? root
        .replace(/^(?:[A-Za-z]:|\/\/[^/]+\/[^/]+)/, "")
        .split("/")
        .filter(Boolean)
    : null;
  const normalizedScopes = scopeList.map((scope) => ({
    ...scope,
    paths: Array.isArray(scope?.paths)
      ? scope.paths.map((path) => relativePath(path, checkoutParts))
      : []
  }));
  const scopeNames = scopeList.map((scope) =>
    typeof scope?.key === "string" ? scope.key.trim() : ""
  );
  const reportedBase = scopeAttempt.result?.baseBranch ?? baseBranch;
  const resolvedBase =
    typeof reportedBase === "string" ? reportedBase.trim() : "";
  const scopeShape =
    (!needsBase || resolvedBase.length > 0) &&
    (!baseBranch || resolvedBase === baseBranch) &&
    typeof scopeAttempt.result?.evidence === "string" &&
    scopeAttempt.result.evidence.trim().length > 0 &&
    scopeList.length >= 1 &&
    scopeList.length <= maxScopes &&
    scopeNames.every((name) => name.length > 0 && !name.includes(":")) &&
    new Set(scopeNames).size === scopeNames.length &&
    normalizedScopes.every(
      (scope) =>
        typeof scope?.description === "string" &&
        scope.description.trim().length > 0 &&
        Array.isArray(scope.paths) &&
        scope.paths.length > 0 &&
        scope.paths.every((path) => path !== null)
    ) &&
    normalizedScopes.every((scope, index) =>
      normalizedScopes
        .slice(index + 1)
        .every((other) =>
          scope.paths.every((path) =>
            other.paths.every(
              (peer) => !ownsPath(path, peer) && !ownsPath(peer, path)
            )
          )
        )
    );
  const scopes = scopeShape ? normalizedScopes : [];
  if (scopeAttempt.error !== undefined) {
    recordPhase("scope", "failed", `Scope agent failed: ${scopeAttempt.error}`);
  } else if (!scopeShape) {
    recordPhase(
      "scope",
      "failed",
      `Scope result is missing, malformed, duplicated, or outside 1 through ${maxScopes} scopes`
    );
  } else {
    recordPhase(
      "scope",
      "completed",
      supplied ? "Used scope supplied by Main" : null,
      {
        baseBranch: resolvedBase || null,
        scopes,
        evidence: scopeAttempt.result.evidence,
        source: supplied ? "argument" : "agent"
      }
    );
  }
  return { scopes, resolvedBase, checkoutParts };
}

async function dispatchScope() {
  log("Separating the delivery goal into scopes");
  return runAgent(
    compose(
      "Separate the delivery goal into disjoint exploration scopes for this repository.",
      taskPart,
      needsBase
        ? basePart
        : "This run only needs a plan, and Main supplied no base. Scope the provided sources without Git metadata lookups.",
      needsBase
        ? "Report the requested or discovered base branch. If external paths are in scope, report the original checkout root so parent-relative paths can be compared."
        : "Leave the base branch unset. Report the original checkout root only if known and needed to compare parent-relative paths.",
      `Return between 1 and ${maxScopes} scopes that together cover the whole goal.`,
      "Give each scope a short unique key, a one-sentence description, and the repository paths it owns.",
      "Express paths relative to the original repository root, including ../shared for an authorized sibling directory.",
      "Couple paths into one scope only where the goal itself requires it.",
      readOnlyPart,
      promptParts.scope
    ),
    {
      agentType: "Explore",
      label: "scope",
      ...(efforts.scope === undefined ? {} : { effort: efforts.scope }),
      phase: "Scope",
      schema: {
        properties: {
          baseBranch: { type: "string" },
          checkoutRoot: { type: "string" },
          evidence: { type: "string" },
          scopes: {
            items: {
              properties: {
                description: { type: "string" },
                key: { type: "string" },
                paths: { items: { type: "string" }, type: "array" }
              },
              required: ["description", "key", "paths"],
              type: "object"
            },
            type: "array"
          }
        },
        required: [...(needsBase ? ["baseBranch"] : []), "evidence", "scopes"],
        type: "object"
      }
    }
  );
}

async function exploreScopes() {
  if (incompletePredecessor("explore") !== undefined) {
    recordPhase(
      "explore",
      "skipped",
      "Required Scope predecessor is incomplete"
    );
  } else if (skipped.explore) {
    recordPhase(
      "explore",
      "skipped",
      "Explicit dispatch skip, so parallel exploration did not run"
    );
  } else {
    log(
      `Exploring ${scopes.length} scope${scopes.length === 1 ? "" : "s"} in parallel`
    );
    for (const scope of scopes) {
      graph.nodes.push({
        ...nodeFor("explore"),
        key: `explore:${scope.key}`,
        operation: "Explore one scope",
        prerequisites: [],
        owner: `explorer:${scope.key}`,
        authority: "read assigned scope; no writes",
        ownership: { kind: "scope", value: scope },
        inputs: { scope, task },
        outputs: ["summary", "risks", "evidence", "optional stopReason"],
        status: "pending",
        completionEvidence: []
      });
      connect("scope", `explore:${scope.key}`);
      connect(`explore:${scope.key}`, "explore");
    }
    const attempts = await parallel(
      scopes.map(
        (scope) => () =>
          runAgent(
            compose(
              `Explore the repository for scope ${scope.key} only.`,
              `Scope description: ${scope.description}`,
              `Scope paths: ${scope.paths.join(", ")}`,
              taskPart,
              "Set stopReason only when the evidence shows this scope needs no further action for the requested goal. Leave it unset if a requested deliverable or a cross-scope question remains.",
              "Report the current behavior in these paths, the consumers a change would affect, and the concrete risks.",
              "Other explorers own the other scopes, so stay inside this scope.",
              readOnlyPart,
              promptParts.explore
            ),
            {
              agentType: "Explore",
              label: `explore:${scope.key}`,
              ...(efforts.explore === undefined
                ? {}
                : { effort: efforts.explore }),
              phase: "Explore",
              schema: {
                properties: {
                  evidence: { type: "string" },
                  risks: { items: { type: "string" }, type: "array" },
                  stopReason: { type: "string" },
                  summary: { type: "string" }
                },
                required: ["evidence", "risks", "summary"],
                type: "object"
              }
            }
          ).then((attempt) => ({ attempt, key: scope.key }))
      )
    );
    const exploreFailures = [];
    const explorations = [];
    for (const [index, item] of attempts.entries()) {
      if (item === null) {
        const key = scopes[index].key;
        setOutcome(`explore:${key}`, "failed", "Explorer returned no result");
        exploreFailures.push(`${key}: explorer returned no result`);
      } else if (item.attempt.error !== undefined) {
        setOutcome(`explore:${item.key}`, "failed", item.attempt.error);
        exploreFailures.push(`${item.key}: ${item.attempt.error}`);
      } else {
        const result = item.attempt.result;
        const shape =
          typeof result?.summary === "string" &&
          result.summary.trim().length > 0 &&
          Array.isArray(result?.risks) &&
          result.risks.every((risk) => typeof risk === "string") &&
          typeof result?.evidence === "string" &&
          result.evidence.trim().length > 0;
        if (shape) {
          setOutcome(`explore:${item.key}`, "completed", null, result);
          const { evidence, risks, stopReason, summary } = result;
          explorations.push({
            key: item.key,
            evidence,
            risks,
            summary,
            ...(stopReason === undefined ? {} : { stopReason })
          });
        } else {
          setOutcome(
            `explore:${item.key}`,
            "failed",
            "result is missing or malformed",
            result
          );
          exploreFailures.push(`${item.key}: result is missing or malformed`);
        }
      }
    }
    if (exploreFailures.length > 0) {
      recordPhase("explore", "failed", exploreFailures.join("; "), {
        explorations
      });
    } else {
      recordPhase("explore", "completed", null, { explorations });
    }
    return explorations;
  }
  return [];
}

async function planDelivery() {
  const predecessor = incompletePredecessor("plan");
  if (predecessor !== undefined) {
    recordPhase(
      "plan",
      "skipped",
      `Required ${phaseTitles[predecessor]} predecessor is incomplete`
    );
  } else if (skipped.plan) {
    recordPhase(
      "plan",
      "skipped",
      "Explicit dispatch skip, so planning did not run"
    );
  } else {
    nodeFor("plan").inputs = { scopes, explorations };
    const planAttempt = await runAgent(
      compose(
        "Decide from the evidence whether this goal still needs work.",
        "If the goal is already satisfied, the reported problem is invalid, or no action is warranted, return an empty units array, a specific stopReason, and supporting evidence. Missing information alone does not justify stopping.",
        "When work remains, omit stopReason.",
        readOnlyPart,
        taskPart,
        `Scope results: ${JSON.stringify(scopes)}`,
        `Exploration results: ${JSON.stringify(explorations)}`,
        `Decide whether the goal needs one work unit or several disjoint work units, and define at most ${unitCap} units.`,
        "Use separate units only when parallel ownership or context size requires them, and prefer the fewest units that cover the goal.",
        "Give each unit a short key and owned paths. Its instructions must tell the implementer which behavior to deliver, which constraints to preserve, and what result the checks should show.",
        "Express paths relative to the original repository root, including ../shared for an authorized sibling directory.",
        "List each owned path once, and share no owned path between units.",
        promptParts.plan
      ),
      {
        label: "plan",
        ...(efforts.plan === undefined ? {} : { effort: efforts.plan }),
        phase: "Plan",
        schema: {
          properties: {
            evidence: { type: "string" },
            stopReason: { type: "string" },
            units: {
              items: {
                properties: {
                  instructions: { type: "string" },
                  key: { type: "string" },
                  paths: { items: { type: "string" }, type: "array" }
                },
                required: ["instructions", "key", "paths"],
                type: "object"
              },
              type: "array"
            }
          },
          required: ["evidence", "units"],
          type: "object"
        }
      }
    );
    const unitList = Array.isArray(planAttempt.result?.units)
      ? planAttempt.result.units
      : [];
    const unitNames = unitList.map((unit) =>
      typeof unit?.key === "string" ? unit.key.trim() : ""
    );
    const ownedPaths = unitList.flatMap((unit) =>
      Array.isArray(unit?.paths) && unit.paths.length > 0
        ? unit.paths.map(canonicalPath)
        : [null]
    );
    const { evidence, stopReason } = planAttempt.result ?? {};
    const hasEvidence =
      typeof evidence === "string" && evidence.trim().length > 0;
    const planShape =
      hasEvidence &&
      stopReason === undefined &&
      unitList.length >= 1 &&
      unitList.length <= unitCap &&
      unitNames.every((name) => name.length > 0 && !name.includes(":")) &&
      new Set(unitNames).size === unitNames.length &&
      ownedPaths.every((path) => path !== null) &&
      new Set(ownedPaths).size === ownedPaths.length &&
      ownedPaths.every((path, index) =>
        ownedPaths.every(
          (other, otherIndex) =>
            otherIndex === index ||
            (!ownsPath(path, other) && !ownsPath(other, path))
        )
      ) &&
      unitList.every(
        (unit) =>
          typeof unit?.instructions === "string" &&
          unit.instructions.trim().length > 0 &&
          Array.isArray(unit.paths) &&
          unit.paths.length > 0
      );
    if (planAttempt.error !== undefined) {
      recordPhase("plan", "failed", `Plan agent failed: ${planAttempt.error}`);
    } else if (
      hasEvidence &&
      typeof stopReason === "string" &&
      stopReason.trim() &&
      Array.isArray(planAttempt.result.units) &&
      unitList.length === 0
    ) {
      const decision = { units: [], stopReason, evidence };
      recordPhase("plan", "completed", null, decision);
      return decision;
    } else if (!planShape) {
      recordPhase(
        "plan",
        "failed",
        `Expected an evidence-backed stop or a plan with 1 through ${unitCap} disjoint, valid work units`
      );
    } else if (
      input.scope !== undefined &&
      !ownedPaths.every((path) =>
        scopes.some((scope) =>
          scope.paths.some((owned) => ownsPath(owned, path))
        )
      )
    ) {
      recordPhase(
        "plan",
        "failed",
        "Planned paths exceed the scope supplied by Main",
        { ownedPaths, evidence }
      );
    } else {
      const units = unitList.map((unit) => ({
        instructions: unit.instructions,
        key: unit.key.trim(),
        paths: unit.paths.map(canonicalPath)
      }));
      const decision = { units, evidence };
      recordPhase("plan", "completed", null, decision);
      return decision;
    }
  }
  return null;
}

function explorationsFor(unit) {
  return explorations.filter((exploration) => {
    const scope = scopes.find((entry) => entry.key === exploration.key);
    return (
      scope !== undefined &&
      scope.paths.some((owned) =>
        unit.paths.some(
          (path) => ownsPath(owned, path) || ownsPath(path, owned)
        )
      )
    );
  });
}

async function dispatchImplementation(
  targets,
  findings,
  roundLabel,
  requiredStart,
  verificationKey
) {
  const expectedStart =
    verificationKey === null
      ? null
      : nodeFor(verificationKey).completionEvidence.at(-1).result.commit;
  for (const unit of targets) {
    const key = `implement:${unit.key}${roundLabel}`;
    graph.nodes.push({
      ...nodeFor(activeNodes.implement),
      key,
      operation: "Implement one owned unit",
      prerequisites: [],
      owner: `worker:${unit.key}`,
      authority:
        "edit owned paths in an isolated worktree; commit owned branch; no push",
      ownership: { kind: "unit paths", value: unit.paths },
      inputs: {
        unit,
        explorations: explorationsFor(unit),
        requiredStart,
        startCommit: expectedStart,
        findings:
          findings?.filter((finding) =>
            unit.paths.some((path) => ownsPath(path, finding.file))
          ) ?? null
      },
      outputs: [
        "branch",
        "commit",
        "startRef",
        "startCommit",
        "changedFiles",
        "checks",
        "diffSummary",
        "evidence"
      ],
      completionEvidence: []
    });
    connect("plan", key);
    if (verificationKey !== null) {
      connect(verificationKey, key);
    }
    for (const item of nodeFor(key).inputs.explorations) {
      connect(`explore:${item.key}`, key);
    }
    connect(key, activeNodes.implement);
  }
  const results = await parallel(
    targets.map((unit) => () => {
      const {
        explorations: unitExplorations,
        findings: unitFindings,
        startCommit
      } = nodeFor(`implement:${unit.key}${roundLabel}`).inputs;
      const options = {
        isolation: "worktree",
        label: `implement:${unit.key}${roundLabel}`,
        ...(efforts.implement === undefined
          ? {}
          : { effort: efforts.implement }),
        phase: "Implement",
        schema: {
          properties: {
            branch: { type: "string" },
            commit: { type: "string" },
            changedFiles: { items: { type: "string" }, type: "array" },
            checks: {
              items: {
                properties: {
                  command: { type: "string" },
                  status: {
                    enum: ["failed", "passed", "skipped"],
                    type: "string"
                  }
                },
                required: ["command", "status"],
                type: "object"
              },
              type: "array"
            },
            diffSummary: { type: "string" },
            evidence: { type: "string" },
            startRef: { type: "string" },
            startCommit: { type: "string" }
          },
          required: [
            "branch",
            "commit",
            "changedFiles",
            "checks",
            "diffSummary",
            "evidence",
            "startRef",
            "startCommit"
          ],
          type: "object"
        }
      };
      return runAgent(
        compose(
          `Implement delivery work unit ${unit.key}.`,
          `Owned paths: ${unit.paths.join(", ")}`,
          `Unit instructions: ${unit.instructions}`,
          unitFindings === null
            ? ""
            : `Fix these review findings inside your owned paths: ${JSON.stringify(unitFindings)}`,
          `Relevant exploration: ${JSON.stringify(unitExplorations)}`,
          "You run in an isolated worktree that may start from the remote default branch, so verify its starting reference before editing.",
          `Required starting reference: ${requiredStart}. Synchronize to it before editing when it does not match, and report the reference you verified.`,
          startCommit === null
            ? ""
            : `Start from the reviewed commit ${startCommit}. Refuse a moved starting ref and report the full resolved startCommit.`,
          `Create a new branch named for unit ${unit.key}${roundLabel ? `-fix-${roundsUsed}` : ""} from the required starting reference, and commit your changes there with a descriptive subject. Do not commit directly to the starting branch.`,
          "Edit only files inside your owned paths, and report every changed file as a repository-relative path.",
          "Run the narrowest relevant checks and report each command with status passed, failed, or skipped.",
          "Report the branch, full commit ID covered by the checks, the verified starting reference and its full startCommit, the changed files, and the checks.",
          "Do not rewrite existing commits, do not push, and do not publish.",
          promptParts.implement
        ),
        options
      ).then((attempt) => ({ attempt, key: unit.key, paths: unit.paths }));
    })
  );
  const failures = [];
  const unitResults = [];
  const attemptResources = [];
  const branchClaims = new Map();
  for (const entry of [
    ...attemptLedger,
    ...results.flatMap((item) =>
      typeof item?.attempt.result?.branch === "string"
        ? [{ branch: item.attempt.result.branch.trim(), key: item.key }]
        : []
    )
  ]) {
    const owners = branchClaims.get(entry.branch) ?? new Set();
    owners.add(entry.key);
    branchClaims.set(entry.branch, owners);
  }
  for (const [index, item] of results.entries()) {
    if (item === null) {
      const key = targets[index].key;
      setOutcome(
        `implement:${key}${roundLabel}`,
        "failed",
        "Implementation agent returned no result"
      );
      failures.push(`${key}: implementation agent returned no result`);
    } else if (item.attempt.error !== undefined) {
      setOutcome(
        `implement:${item.key}${roundLabel}`,
        "failed",
        item.attempt.error
      );
      failures.push(`${item.key}: ${item.attempt.error}`);
    } else {
      const result = item.attempt.result;
      const changedFiles = Array.isArray(result?.changedFiles)
        ? result.changedFiles.map(canonicalPath)
        : [];
      const ownershipHeld =
        changedFiles.length > 0 &&
        changedFiles.every(
          (file) =>
            file !== null && item.paths.some((owned) => ownsPath(owned, file))
        );
      const handoffHeld =
        typeof result?.branch === "string" &&
        result.branch.trim().length > 0 &&
        result.branch.trim() !== resolvedBase &&
        result.branch.trim() !== requiredStart &&
        result.branch.trim() === result.branch &&
        result.startRef === requiredStart &&
        isCommit(result.startCommit) &&
        (expectedStart === null || result.startCommit === expectedStart);
      const evidenceHeld =
        typeof result?.diffSummary === "string" &&
        result.diffSummary.trim().length > 0 &&
        typeof result?.evidence === "string" &&
        result.evidence.trim().length > 0 &&
        isCommit(result.commit);
      const problems = [];
      if (!ownershipHeld) {
        problems.push(
          "changed files are malformed or outside the assigned paths"
        );
      }
      if (!checksPassed(result?.checks)) {
        problems.push("required checks are missing or did not all pass");
      }
      if (!handoffHeld) {
        problems.push(
          `unit branch is missing or equals the base or starting branch, or the worktree did not start from ${requiredStart}`
        );
      }
      if (!evidenceHeld) {
        problems.push("result is missing or malformed");
      }
      if (
        typeof result?.branch === "string" &&
        branchClaims.get(result.branch.trim())?.size > 1
      ) {
        problems.push("unit branch is claimed by more than one unit");
      }
      if (
        typeof result?.branch === "string" &&
        result.branch.trim().length > 0
      ) {
        attemptResources.push({
          branch: result.branch.trim(),
          key: item.key,
          startRef:
            typeof result?.startRef === "string" &&
            result.startRef.trim().length > 0
              ? result.startRef.trim()
              : null,
          state: problems.length === 0 ? "implemented" : "attempted"
        });
      }
      setOutcome(
        `implement:${item.key}${roundLabel}`,
        problems.length === 0 ? "completed" : "failed",
        problems.join(", ") || null,
        result
      );
      if (problems.length === 0) {
        unitResults.push({
          branch: result.branch,
          changedFiles,
          checks: result.checks,
          commit: result.commit,
          diffSummary: result.diffSummary,
          evidence: result.evidence,
          key: item.key,
          startCommit: result.startCommit,
          startRef: result.startRef
        });
      } else {
        failures.push(`${item.key}: ${problems.join(", ")}`);
      }
    }
  }
  if (new Set(unitResults.map(({ startCommit }) => startCommit)).size > 1) {
    failures.push("Unit worktrees used different starting commits");
  }
  return failures.length > 0
    ? {
        attemptResources,
        reason: failures.join("; "),
        status: "failed",
        unitResults
      }
    : { attemptResources, reason: null, status: "completed", unitResults };
}

async function dispatchIntegration(
  currentUnits,
  destination,
  destinationStart
) {
  const unitResources = currentUnits.map((unit) => ({
    ...unit,
    paths: units.find((plan) => plan.key === unit.key).paths
  }));
  const node = nodeFor(activeNodes.integrate);
  node.inputs = {
    destination,
    destinationStart,
    baseBranch: resolvedBase,
    unitResources
  };
  node.ownership = { kind: "candidate branch", value: destination };
  const attempt = await runAgent(
    compose(
      `Integrate into the authorized destination: ${destination}.`,
      `Expected destination commit before writing: ${destinationStart}.`,
      `Base branch: ${resolvedBase}`,
      `Unit resources: ${JSON.stringify(unitResources)}`,
      "Before writing, verify the actual checkout, destination, resolved base, branch protections, and named unit branches. Refuse a protected destination or one equal to the base.",
      "Verify each unit branch resolves to its accepted commit before merging. Refuse any changed unit ref.",
      "Verify the destination still resolves to the expected commit before writing and report the actual startCommit. Leave a moved or partially integrated destination for Main to reconcile.",
      "Inspect each unit branch by its own changes since its merge base with the destination, as `git diff <destination>...<unit branch>` reports them, including both sides of renames, deletions, and symlinks. Refuse unrelated changes and conflicts outside the responsible unit paths.",
      "Do not judge a unit by a direct comparison with the current destination, because the destination advances as other units integrate and their files would appear deleted. A unit branch the destination already contains has no new changes, so report it merged without merging it again.",
      "Merge only the named branches into the exact destination. Report all changed paths and actual diff evidence, including conflict resolutions. Report unresolved conflicts instead of forcing a merge.",
      "Run the relevant checks on the combined candidate and report each command with status passed, failed, or skipped.",
      "Report the final task branch name, the full combined commit ID covered by the checks, and the state of every named unit resource.",
      "Commit the merged result on the task branch, do not push, and do not publish.",
      promptParts.integrate
    ),
    {
      label: "integrate",
      ...(efforts.integrate === undefined ? {} : { effort: efforts.integrate }),
      phase: "Integrate",
      schema: {
        properties: {
          branch: { type: "string" },
          commit: { type: "string" },
          changedFiles: { items: { type: "string" }, type: "array" },
          checks: {
            items: {
              properties: {
                command: { type: "string" },
                status: {
                  enum: ["failed", "passed", "skipped"],
                  type: "string"
                }
              },
              required: ["command", "status"],
              type: "object"
            },
            type: "array"
          },
          conflicts: { items: { type: "string" }, type: "array" },
          evidence: { type: "string" },
          merged: { type: "boolean" },
          startCommit: { type: "string" },
          resources: {
            items: {
              properties: {
                branch: { type: "string" },
                key: { type: "string" },
                state: {
                  enum: ["failed", "merged", "retained"],
                  type: "string"
                }
              },
              required: ["branch", "key", "state"],
              type: "object"
            },
            type: "array"
          }
        },
        required: [
          "branch",
          "commit",
          "changedFiles",
          "checks",
          "conflicts",
          "evidence",
          "merged",
          "startCommit",
          "resources"
        ],
        type: "object"
      }
    }
  );
  const result = attempt.result;
  const resources = Array.isArray(result?.resources) ? result.resources : [];
  const currentKeys = currentUnits.map((unit) => unit.key);
  const branchByKey = new Map(
    currentUnits.map((unit) => [unit.key, unit.branch])
  );
  const namedKeys = resources
    .map((resource) => (typeof resource?.key === "string" ? resource.key : ""))
    .filter((key) => key.length > 0);
  const ledgerHeld =
    resources.every(
      (resource) =>
        typeof resource?.branch === "string" &&
        resource.branch.trim().length > 0 &&
        ["failed", "merged", "retained"].includes(resource?.state) &&
        currentKeys.includes(resource?.key) &&
        resource.branch === branchByKey.get(resource.key)
    ) &&
    new Set(namedKeys).size === namedKeys.length &&
    currentKeys.every((key) => namedKeys.includes(key));
  const shape =
    result?.branch === destination &&
    result.startCommit === destinationStart &&
    Array.isArray(result?.changedFiles) &&
    result.changedFiles.every((file) => {
      const path = canonicalPath(file);
      return (
        path !== null &&
        path === file &&
        units.some((unit) => unit.paths.some((owned) => ownsPath(owned, path)))
      );
    }) &&
    typeof result?.evidence === "string" &&
    result.evidence.trim().length > 0 &&
    typeof result?.merged === "boolean" &&
    Array.isArray(result?.conflicts) &&
    result.conflicts.every((conflict) => typeof conflict === "string") &&
    checkEntries(result?.checks) &&
    ledgerHeld;
  const consistent =
    shape &&
    (result.merged
      ? result.conflicts.length === 0 &&
        resources.every((resource) => resource.state === "merged")
      : resources.some((resource) => resource.state !== "merged"));
  const retained = {
    branch: typeof result?.branch === "string" ? result.branch : "",
    checks: Array.isArray(result?.checks) ? result.checks : [],
    conflicts: Array.isArray(result?.conflicts) ? result.conflicts : [],
    evidence: result?.evidence ?? null,
    resources: consistent ? resources : [],
    startCommit: result?.startCommit ?? null
  };
  if (attempt.error !== undefined) {
    return {
      ...retained,
      reason: `Integration agent failed: ${attempt.error}`,
      status: "failed"
    };
  }
  if (!shape) {
    return {
      ...retained,
      reason:
        "Integration result is missing, malformed, or does not account for the destination start and every named unit branch",
      status: "failed"
    };
  }
  if (!consistent) {
    return {
      ...retained,
      branch: result.branch,
      reason:
        "Integration reported a merge outcome that contradicts its conflicts or unit resource states, so no resource state applies",
      status: "failed"
    };
  }
  if (!result.merged) {
    return {
      ...retained,
      branch: result.branch,
      reason: `Integration left the branch unmerged: ${result.conflicts.join("; ")}`,
      status: "failed"
    };
  }
  if (!checksPassed(result.checks) || !isCommit(result.commit)) {
    return {
      ...retained,
      branch: result.branch,
      reason:
        "Required checks or the checked commit on the combined candidate are missing or invalid",
      status: "failed"
    };
  }
  return {
    branch: result.branch,
    changedFiles: result.changedFiles,
    checks: result.checks,
    commit: result.commit,
    conflicts: result.conflicts,
    evidence: result.evidence,
    reason: null,
    resources,
    startCommit: result.startCommit,
    status: "completed"
  };
}

function retainAttempts(attemptResources, attemptLedger) {
  attemptResources.forEach((resource) => {
    const index = attemptLedger.findIndex(
      (entry) => entry.key === resource.key && entry.branch === resource.branch
    );
    if (index === -1) {
      attemptLedger.push(resource);
    } else {
      attemptLedger[index] = resource;
    }
  });
}

function applyLedger(integrationState, attemptLedger) {
  integrationState.resources?.forEach((resource) => {
    const index = attemptLedger.findIndex(
      (candidate) =>
        candidate.key === resource.key && candidate.branch === resource.branch
    );
    if (index !== -1) {
      attemptLedger[index] = { ...attemptLedger[index], state: resource.state };
    }
  });
}

function acceptedCandidate(state) {
  if (state.status === "completed") {
    return { branch: state.branch, commit: state.commit };
  }
  return state.status === "skipped" && state.branch !== undefined
    ? { branch: state.branch, commit: unitResults[0].commit }
    : null;
}

async function dispatchSweep(candidate) {
  nodeFor(activeNodes.sweep).inputs = { baseBranch: resolvedBase, candidate };
  const attempt = await runAgent(
    compose(
      "Run a quick environment-exposure sweep over the integrated change only.",
      `Base branch: ${resolvedBase}`,
      `Candidate branch: ${candidate.branch}`,
      `Checked candidate commit: ${candidate.commit}`,
      "Inspect this named branch, not the coordinator checkout.",
      "Resolve both branch refs. Refuse a candidate whose tip differs from the checked commit. Inspect the diff at those commits and the candidate checkout's untracked files, and read only those files.",
      "Flag credentials, tokens, private hostnames, absolute home paths, session identifiers, and private environment details.",
      "For each exposure, give the file, kind, and enough redacted detail to locate it. Omit the sensitive value.",
      "Report the full candidate and base commit IDs actually scanned and an empty list when the change is clean.",
      "Report coverage complete only after inspecting the whole diff and checking the candidate worktrees for untracked files. Use incomplete and explain if any required source is inaccessible.",
      readOnlyPart,
      promptParts.sweep
    ),
    {
      agentType: "Explore",
      label: "sweep",
      ...(efforts.sweep === undefined ? {} : { effort: efforts.sweep }),
      phase: "Sweep",
      schema: {
        properties: {
          baseCommit: { type: "string" },
          commit: { type: "string" },
          coverage: { enum: ["complete", "incomplete"], type: "string" },
          evidence: { type: "string" },
          exposures: {
            items: {
              properties: {
                detail: { type: "string" },
                file: { type: "string" },
                kind: { type: "string" }
              },
              required: ["detail", "file", "kind"],
              type: "object"
            },
            type: "array"
          }
        },
        required: ["baseCommit", "commit", "coverage", "evidence", "exposures"],
        type: "object"
      }
    }
  );
  const result = attempt.result;
  const shape =
    result?.commit === candidate.commit &&
    isCommit(result?.baseCommit) &&
    typeof result?.evidence === "string" &&
    result.evidence.trim().length > 0 &&
    Array.isArray(result?.exposures) &&
    result.exposures.every(
      (exposure) =>
        typeof exposure?.file === "string" &&
        exposure.file.trim().length > 0 &&
        typeof exposure?.kind === "string" &&
        exposure.kind.trim().length > 0 &&
        typeof exposure?.detail === "string" &&
        exposure.detail.trim().length > 0
    );
  if (attempt.error !== undefined) {
    return { reason: `Sweep agent failed: ${attempt.error}`, status: "failed" };
  }
  if (!shape) {
    return {
      reason:
        "Sweep result is missing, malformed, or covers a different candidate commit",
      status: "failed"
    };
  }
  return {
    baseCommit: result.baseCommit,
    commit: result.commit,
    coverage: result.coverage,
    evidence: result.evidence,
    exposures: result.exposures,
    reason:
      result.coverage === "complete"
        ? null
        : "Sweep did not cover the required sources",
    status: result.coverage === "complete" ? "completed" : "failed"
  };
}

async function dispatchPublish(
  currentUnits,
  integrationState,
  candidate,
  sweepState,
  priorUrl
) {
  const change = {
    combinedChecks:
      integrationState.status === "completed"
        ? integrationState.checks
        : "not required",
    units: currentUnits.map(({ branch, changedFiles, checks, key }) => ({
      branch,
      changedFiles,
      checks,
      key
    }))
  };
  const node = nodeFor(activeNodes.publish);
  node.inputs = {
    repository,
    candidate,
    baseBranch: resolvedBase,
    baseCommit: sweepState.baseCommit,
    change,
    priorUrl,
    issue
  };
  node.ownership = {
    kind: "publication",
    value: {
      repository,
      branch: candidate.branch,
      base: resolvedBase,
      priorUrl
    }
  };
  const attempt = await runAgent(
    compose(
      "Publish the named candidate branch for review.",
      taskPart,
      `Authorized repository: ${repository}`,
      `Base branch: ${resolvedBase}`,
      `Candidate branch: ${candidate.branch}`,
      `Scanned commits: ${JSON.stringify({ candidate: candidate.commit, base: sweepState.baseCommit })}`,
      "Before pushing, verify the actual push remote and request repository match the authorized repository. Verify the local candidate ref and the destination's base ref are still at the scanned commits, confirm the candidate is not the base, and check branch protections. Refuse any mismatch, fork, or protected candidate.",
      "Push only the scanned candidate commit and create or update the request for the exact head and base branches. Read back the posted repository, head and base branches, and head and base commits, and report what the destination actually shows.",
      issuePart,
      priorUrl === null
        ? ""
        : `Update the existing open request at ${priorUrl} with the fixed change instead of creating another request.`,
      priorUrl === null
        ? ""
        : "Verify the existing request's repository and head and base branches before writing.",
      `Change summary: ${JSON.stringify(change)}`,
      "Create a review request using an authorized interface supported by the destination.",
      "Reuse the existing open request for this branch instead of creating a duplicate.",
      "Describe the change, the per-unit and combined checks that ran, and the remaining limits, and keep private environment details out of the request.",
      "Do not merge, close, approve, or change repository settings.",
      promptParts.publish
    ),
    {
      label: "publish",
      ...(efforts.publish === undefined ? {} : { effort: efforts.publish }),
      phase: "Publish",
      schema: {
        properties: {
          action: { enum: ["created", "updated"], type: "string" },
          baseCommit: { type: "string" },
          baseBranch: { type: "string" },
          commit: { type: "string" },
          evidence: { type: "string" },
          headBranch: { type: "string" },
          repository: { type: "string" },
          url: { type: "string" }
        },
        required: [
          "action",
          "baseBranch",
          "baseCommit",
          "commit",
          "evidence",
          "headBranch",
          "repository",
          "url"
        ],
        type: "object"
      }
    }
  );
  const result = attempt.result;
  const observed =
    result === null || typeof result !== "object"
      ? null
      : {
          action: result.action ?? null,
          baseBranch: result.baseBranch ?? null,
          baseCommit: result.baseCommit ?? null,
          commit: result.commit ?? null,
          headBranch: result.headBranch ?? null,
          repository: result.repository ?? null,
          url: result.url ?? null
        };
  const shape =
    result?.commit === candidate.commit &&
    result?.baseCommit === sweepState.baseCommit &&
    result?.repository === repository &&
    result?.headBranch === candidate.branch &&
    result?.baseBranch === resolvedBase &&
    typeof result?.evidence === "string" &&
    result.evidence.trim().length > 0 &&
    typeof result?.url === "string" &&
    result.url.trim().length > 0 &&
    (result?.action === "created" || result?.action === "updated");
  if (attempt.error !== undefined) {
    return {
      reason: `Publish agent failed: ${attempt.error}`,
      status: "failed"
    };
  }
  if (!shape) {
    return {
      observed,
      reason:
        "Publish result is missing, malformed, or does not match the authorized repository, refs, and scanned commits",
      status: "failed"
    };
  }
  if (
    priorUrl !== null &&
    (result.url !== priorUrl || result.action !== "updated")
  ) {
    return {
      observed,
      reason:
        "Publication did not update the previously posted request, so publication is blocked",
      status: "failed"
    };
  }
  return {
    action: result.action,
    baseBranch: result.baseBranch,
    baseCommit: result.baseCommit,
    commit: result.commit,
    evidence: result.evidence,
    headBranch: result.headBranch,
    reason: null,
    repository: result.repository,
    status: "completed",
    url: result.url
  };
}

async function dispatchReview(
  currentUnits,
  integrationState,
  candidate,
  publishState,
  round
) {
  const change = {
    integration: {
      branch: integrationState.branch,
      checks: integrationState.checks ?? [],
      status: integrationState.status
    },
    units: currentUnits.map(({ branch, changedFiles, checks, key }) => ({
      branch,
      changedFiles,
      checks,
      key
    }))
  };
  nodeFor(activeNodes.review).inputs = {
    candidate,
    baseBranch: resolvedBase,
    publication: publishState,
    change
  };
  const attempt = await runAgent(
    compose(
      "Independently review the complete current change for the delivery goal.",
      `Candidate branch: ${candidate.branch}.`,
      taskPart,
      `Base branch: ${resolvedBase}`,
      issuePart,
      `Change summary: ${JSON.stringify(change)}`,
      `Review the posted candidate at ${publishState.url}, including its request description.`,
      `Posted commits to verify: ${JSON.stringify({ candidate: publishState.commit, base: publishState.baseCommit })}`,
      "Read back the request's actual head and base commits. Review this exact diff and report the full commit IDs inspected. If they differ from the expected commits, do not claim a passing review.",
      "Inspect the change and the affected consumers beyond the changed lines.",
      "Report coverage complete only when the whole posted diff and affected consumers needed for the review were inspected. Use incomplete and explain any missing required coverage.",
      "For each blocking finding, cite code, a requirement, or a safe reproduction in its detail and describe the realistic failure scenario.",
      "Distinguish new defects from pre-existing issues. Return fix-required only for supported findings that block acceptance, correctness, safety, or required checks.",
      "Return an empty findings list with verdict pass when no actionable defect remains.",
      readOnlyPart,
      promptParts.review
    ),
    {
      label: "review",
      ...(efforts.review === undefined ? {} : { effort: efforts.review }),
      phase: "Review",
      schema: {
        properties: {
          baseCommit: { type: "string" },
          commit: { type: "string" },
          coverage: { enum: ["complete", "incomplete"], type: "string" },
          evidence: { type: "string" },
          findings: {
            items: {
              properties: {
                detail: { type: "string" },
                file: { type: "string" },
                scenario: { type: "string" }
              },
              required: ["detail", "file", "scenario"],
              type: "object"
            },
            type: "array"
          },
          verdict: { enum: ["fix-required", "pass"], type: "string" }
        },
        required: [
          "baseCommit",
          "commit",
          "coverage",
          "evidence",
          "findings",
          "verdict"
        ],
        type: "object"
      }
    }
  );
  const result = attempt.result;
  const commitsMatch =
    result?.commit === publishState.commit &&
    result?.baseCommit === publishState.baseCommit;
  const shape =
    typeof result?.evidence === "string" &&
    result.evidence.trim().length > 0 &&
    Array.isArray(result?.findings) &&
    result.findings.every(
      (finding) =>
        typeof finding?.file === "string" &&
        canonicalPath(finding.file) === finding.file &&
        typeof finding?.detail === "string" &&
        finding.detail.trim().length > 0 &&
        typeof finding?.scenario === "string" &&
        finding.scenario.trim().length > 0
    ) &&
    ((result?.verdict === "pass" && result.findings.length === 0) ||
      (result?.verdict === "fix-required" && result.findings.length > 0));
  if (attempt.error !== undefined) {
    return {
      reason: `Review agent failed: ${attempt.error}`,
      status: "failed"
    };
  }
  if (!shape || !commitsMatch) {
    return {
      evidence: result?.evidence ?? null,
      findings: result?.findings ?? null,
      reason:
        result?.verdict === "fix-required" &&
        Array.isArray(result?.findings) &&
        result.findings.length === 0
          ? "Review verdict fix-required has no findings"
          : "Review result is missing, malformed, or covers a different posted diff",
      status: "failed",
      verdict: result?.verdict ?? null
    };
  }
  const findings = result.findings.map((finding, index) => ({
    ...finding,
    id: `review-${round + 1}-finding-${index + 1}`
  }));
  return {
    baseCommit: result.baseCommit,
    commit: result.commit,
    coverage: result.coverage,
    evidence: result.evidence,
    findings,
    reason:
      result.coverage === "complete"
        ? null
        : "Review did not cover the required sources",
    status: result.coverage === "complete" ? "completed" : "failed",
    verdict: result.verdict
  };
}

async function verifyFindings(key, review, candidate, publication) {
  graph.nodes.push({
    key,
    operation: "Independently verify candidate findings",
    prerequisites: [],
    inputs: { candidate, publication, findings: review.findings },
    outputs: ["commit", "baseCommit", "dispositions", "confirmed"],
    owner: "independent finding verifier",
    authority: "read the posted diff and affected source; no writes",
    completionEvidence: [],
    status: "pending",
    reason: null
  });
  connect(activeNodes.review, key);
  connect(activeNodes.publish, key);
  const attempt = await runAgent(
    compose(
      "Independently check the review findings against the posted source and the delivery goal. Treat each finding as a claim to verify.",
      taskPart,
      `Posted request and expected commits: ${JSON.stringify({ url: publication.url, commit: publication.commit, baseCommit: publication.baseCommit })}`,
      `Review findings: ${JSON.stringify(review.findings)}`,
      "Inspect the exact diff and relevant consumers. Report the candidate and base commits you inspected and one disposition per ID with concrete evidence. Use unverified when the relevant source or facts are unavailable.",
      readOnlyPart
    ),
    {
      agentType: "Explore",
      label: key,
      ...(efforts.review === undefined ? {} : { effort: efforts.review }),
      phase: "Review",
      schema: {
        properties: {
          baseCommit: { type: "string" },
          commit: { type: "string" },
          dispositions: {
            type: "array",
            items: {
              properties: {
                id: { type: "string" },
                status: {
                  enum: ["confirmed", "refuted", "unverified"],
                  type: "string"
                },
                evidence: { type: "string" }
              },
              required: ["id", "status", "evidence"],
              type: "object"
            }
          }
        },
        required: ["baseCommit", "commit", "dispositions"],
        type: "object"
      }
    }
  );
  const dispositions = attempt.result?.dispositions;
  const byId = new Map();
  if (Array.isArray(dispositions)) {
    for (const item of dispositions) {
      if (
        ["confirmed", "refuted"].includes(item?.status) &&
        typeof item?.evidence === "string" &&
        item.evidence.trim() &&
        !byId.has(item.id)
      ) {
        byId.set(item.id, item);
      }
    }
  }
  const valid =
    attempt.result?.commit === candidate.commit &&
    attempt.result.baseCommit === publication.baseCommit &&
    Array.isArray(dispositions) &&
    dispositions.length === review.findings.length &&
    review.findings.every(({ id }) => byId.has(id));
  const state = valid
    ? {
        status: "completed",
        reason: null,
        commit: attempt.result.commit,
        baseCommit: attempt.result.baseCommit,
        dispositions,
        confirmed: review.findings
          .filter(({ id }) => byId.get(id).status === "confirmed")
          .map((finding) => ({
            ...finding,
            verificationEvidence: byId.get(finding.id).evidence
          }))
      }
    : {
        status: "failed",
        reason:
          attempt.error === undefined
            ? "Finding verification is missing, contradictory, or unresolved"
            : `Finding verifier failed: ${attempt.error}`,
        dispositions: dispositions ?? null
      };
  setOutcome(key, state.status, state.reason, state);
  return state;
}

async function runPublish(
  sweepState,
  currentUnits,
  integrationState,
  candidate,
  priorUrl
) {
  if (skipped.publish) {
    return {
      reason: "Explicit dispatch skip, so publication did not run",
      status: "skipped"
    };
  }
  const predecessor = incompletePredecessor("publish");
  if (predecessor !== undefined) {
    return {
      reason:
        predecessor === "implement"
          ? "Implementation did not complete, so publication is blocked"
          : predecessor === "integrate"
            ? "Required Integration predecessor is incomplete, so publication is blocked"
            : "Required Sweep predecessor is incomplete",
      status: "skipped"
    };
  }
  const count =
    sweepState.exposures === undefined ? 0 : sweepState.exposures.length;
  if (count > 0) {
    return {
      reason: `The sweep found ${count} exposure${count === 1 ? "" : "s"}, so publication is blocked`,
      status: "skipped"
    };
  }
  if (!repository) {
    return {
      reason:
        "Publication requires the authorized repository as args.repository",
      status: "failed"
    };
  }
  log("Publishing the task branch");
  return dispatchPublish(
    currentUnits,
    integrationState,
    candidate,
    sweepState,
    priorUrl
  );
}

// Graph dispatch, path ownership, and check evidence
function nodeFor(key) {
  return graph.nodes.find((node) => node.key === key);
}

function connect(from, to, type = "result", condition = null) {
  graph.edges.push({ from, to, type, condition });
  nodeFor(to).prerequisites.push(from);
}

function edgeRequired(edge) {
  switch (edge.condition) {
    case null:
      return true;
    case "!skips.explore":
      return !skipped.explore;
    case "units.length > 1":
      return (
        (nodeFor("plan").completionEvidence.at(-1)?.result?.units?.length ??
          0) > 1
      );
    case "units.length > 1 || skips.integrate":
      return (
        skipped.integrate === true ||
        (nodeFor("plan").completionEvidence.at(-1)?.result?.units?.length ??
          0) > 1
      );
    default:
      throw new Error(`Unknown graph edge condition: ${edge.condition}`);
  }
}

function incompletePredecessor(key) {
  return graph.edges.find(
    (edge) =>
      edge.to === activeNodes[key] &&
      edgeRequired(edge) &&
      nodeFor(edge.from).status !== "completed"
  )?.from;
}

function setOutcome(key, status, reason, result = null) {
  const node = nodeFor(key);
  node.status = status;
  node.reason = reason ?? null;
  node.completionEvidence.push({ status, reason: reason ?? null, result });
}

function recordPhase(key, status, reason, result = null) {
  phaseRecords[key] = {
    reason: reason ?? null,
    status,
    title: phaseTitles[key]
  };
  setOutcome(activeNodes[key], status, reason, result);
}

function graphPosition(key) {
  const node = nodeFor(key);
  return [
    `Graph position: ${node.key}; owner: ${node.owner}; authority: ${node.authority}.`,
    `Prerequisites: ${node.prerequisites.length === 0 ? "none" : node.prerequisites.map((parent) => `${parent}=${nodeFor(parent).status}`).join("; ")}.`,
    `Inputs: ${Array.isArray(node.inputs.contract) ? node.inputs.contract.join(", ") : Object.keys(node.inputs.contract).join(", ")}.`,
    `Outputs consumed downstream: ${node.outputs.join(", ")}.`,
    node.ownership === undefined
      ? ""
      : `Owned ${node.ownership.kind}: ${JSON.stringify(node.ownership.value)}.`
  ]
    .filter(Boolean)
    .join("\n");
}

async function runAgent(prompt, options) {
  const phaseKey = options.phase.toLowerCase();
  const key = options.label.includes(":")
    ? options.label
    : activeNodes[phaseKey];
  const node = nodeFor(key);
  const predecessor = graph.edges.find(
    (edge) =>
      edge.to === key &&
      edgeRequired(edge) &&
      nodeFor(edge.from).status !== "completed"
  );
  if (predecessor !== undefined) {
    return {
      error: `Required graph predecessor ${predecessor.from} is incomplete`
    };
  }
  const requestedModel = models[phaseKey] ?? defaultModels[phaseKey];
  const defaultSource =
    requestedModel === undefined ? "host" : "workflow-default";
  node.inputs = {
    contract: node.inputs,
    modelSelection: {
      requestedModel: requestedModel ?? null,
      source: models[phaseKey] === undefined ? defaultSource : "argument"
    }
  };
  node.status = "running";
  return agent(
    compose(graphPosition(key), prompt),
    requestedModel === undefined
      ? options
      : { ...options, model: requestedModel }
  ).then(
    (result) => ({ result }),
    (error) => ({
      error: String(error instanceof Error ? error.message : error)
    })
  );
}

function isCommit(value) {
  return (
    typeof value === "string" && /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(value)
  );
}

function relativePath(path, checkoutParts) {
  if (
    typeof path !== "string" ||
    path.trim().length === 0 ||
    path.includes("\0")
  ) {
    return null;
  }
  const normalized = path.trim().replace(/\\/g, "/");
  if (normalized.startsWith("/") || /^[a-zA-Z]:/.test(normalized)) {
    return null;
  }
  const segments = [...(checkoutParts ?? [])];
  for (const segment of normalized.split("/")) {
    if (segment === ".." && segments.length > 0 && segments.at(-1) !== "..") {
      segments.pop();
    } else if (
      segment !== "" &&
      segment !== "." &&
      !(segment === ".." && checkoutParts !== null)
    ) {
      segments.push(segment);
    }
  }
  const anchor = checkoutParts ?? [];
  let common = 0;
  while (common < anchor.length && anchor[common] === segments[common]) {
    common += 1;
  }
  return (
    [...anchor.slice(common).map(() => ".."), ...segments.slice(common)].join(
      "/"
    ) || null
  );
}

function isExternal(path) {
  return path === ".." || path.startsWith("../");
}

function ownsPath(owned, path) {
  if (owned.split("/").every((segment) => segment === "..")) {
    const parent = `${owned}/..`;
    return path !== parent && !path.startsWith(`${parent}/`);
  }
  return path === owned || path.startsWith(`${owned}/`);
}

function checkEntries(checks) {
  return (
    Array.isArray(checks) &&
    checks.every(
      (check) =>
        typeof check?.command === "string" &&
        check.command.trim().length > 0 &&
        ["failed", "passed", "skipped"].includes(check?.status)
    )
  );
}

function checksPassed(checks) {
  return (
    checkEntries(checks) &&
    checks.length > 0 &&
    checks.every((check) => check.status === "passed")
  );
}
