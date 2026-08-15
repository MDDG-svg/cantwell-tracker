export async function fetchStateAlerts(stateCode) {
  try {
    const res = await fetch(`https://api.weather.gov/alerts/active?area=${stateCode}`, {
      headers: { "User-Agent": "cantwell-tracker (personal dashboard, github.com)" }
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    const features = data.features || [];
    const alerts = features.map(f => ({
      event: f.properties?.event ?? null,
      headline: f.properties?.headline ?? null,
      areaDesc: f.properties?.areaDesc ?? null,
      severity: f.properties?.severity ?? null,
      effective: f.properties?.effective ?? null,
      expires: f.properties?.expires ?? null
    }));
    return {
      active_alerts_count: alerts.length,
      top_alerts: alerts.slice(0, 5),
      fetched_ok: true
    };
  } catch (err) {
    console.warn(`[fetch-state-alerts] failed for ${stateCode}: ${err.message}`);
    return { fetched_ok: false, error: err.message };
  }
}
