import { govtrackFetch } from "./govtrack-fetch.mjs";

// Most recent N floor votes cast by this senator (not just bills they
// sponsored/cosponsored — actual roll-call positions). vote_voter's
// total_count spans a senator's entire career across congresses, but
// ordering by -created and capping the limit naturally surfaces only
// current-session votes since those are always the most recent.
export async function fetchSenatorVotes(govtrackId, limit = 20) {
  const url = `https://www.govtrack.us/api/v2/vote_voter?person=${govtrackId}&limit=${limit}&order_by=-created`;
  const data = await govtrackFetch(url);
  return {
    votes: data.objects.map(v => ({
      voteId: v.option?.vote ?? null,
      question: v.vote?.question ?? null,
      category: v.vote?.category_label ?? null,
      chamber: v.vote?.chamber_label ?? null,
      result: v.vote?.result ?? null,
      passed: v.vote?.passed ?? null,
      date: v.created ?? null,
      position: v.option?.value ?? null,
      votedWithOutcome: v.option?.winner ?? null,
      link: v.vote?.link ?? null,
      congress: v.vote?.congress ?? null
    })),
    fetched_ok: true
  };
}
