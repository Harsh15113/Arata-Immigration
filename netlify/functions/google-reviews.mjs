// Netlify Function: GET /api/google-reviews
// Fetches Arata Immigration's Google rating, review count and latest reviews
// (Google returns at most 5) from the Places API (New), and lets Netlify's CDN
// cache the result for 6 hours so Google is only asked a few times a day.
//
// Netlify environment variables (Site configuration → Environment variables):
//   GOOGLE_PLACES_API_KEY  required — key with "Places API (New)" enabled
//   GOOGLE_PLACE_ID        optional — the business's Place ID; if missing,
//                          it's looked up by name and address each refresh.

const SEARCH_QUERY = 'Arata Immigration, Shankar Plaza, Nanpura, Surat, Gujarat';
const API = 'https://places.googleapis.com/v1';

function json(body, status, cacheSeconds) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Browsers always revalidate; Netlify's CDN holds the response.
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Netlify-CDN-Cache-Control': `public, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`
    }
  });
}

async function findPlaceId(key) {
  const res = await fetch(`${API}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.id'
    },
    body: JSON.stringify({ textQuery: SEARCH_QUERY })
  });
  if (!res.ok) throw new Error(`Place search failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  if (!data.places || !data.places.length) throw new Error('Place search returned no results');
  return data.places[0].id;
}

export default async () => {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return json({ error: 'GOOGLE_PLACES_API_KEY is not set' }, 500, 300);

  try {
    const placeId = process.env.GOOGLE_PLACE_ID || (await findPlaceId(key));
    const res = await fetch(`${API}/places/${encodeURIComponent(placeId)}?languageCode=en`, {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'rating,userRatingCount,reviews,googleMapsUri'
      }
    });
    if (!res.ok) throw new Error(`Place details failed (${res.status}): ${await res.text()}`);
    const place = await res.json();

    const reviews = (place.reviews || [])
      .filter((r) => r.text && r.text.text)
      .map((r) => ({
        author: (r.authorAttribution && r.authorAttribution.displayName) || 'Google user',
        authorUrl: (r.authorAttribution && r.authorAttribution.uri) || '',
        rating: r.rating,
        text: r.text.text,
        when: r.relativePublishTimeDescription || '',
        url: r.googleMapsUri || ''
      }));

    return json({
      rating: place.rating,
      count: place.userRatingCount,
      url: place.googleMapsUri || '',
      reviews
    }, 200, 21600);
  } catch (err) {
    console.error(err);
    return json({ error: 'Could not load Google reviews' }, 502, 300);
  }
};

export const config = { path: '/api/google-reviews' };
