const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function authFetch(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function saveProfile(token: string, data: object) {
  const res = await authFetch('/api/v1/profile', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to save profile');
  }
  return res.json();
}

export async function getProfile(token: string) {
  const res = await authFetch('/api/v1/profile', token);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

// ── Schedule ──────────────────────────────────────────────────────────────────

export async function generateSchedule(token: string, data: object) {
  const res = await authFetch('/api/v1/schedule/generate', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate schedule');
  }
  return res.json();
}

export async function getCurrentSchedule(token: string) {
  const res = await authFetch('/api/v1/schedule/current', token);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}

// ── Progress ──────────────────────────────────────────────────────────────────

export async function updateProgress(
  token: string,
  item_id: string,
  status: string
) {
  const res = await authFetch('/api/v1/progress/update', token, {
    method: 'POST',
    body: JSON.stringify({ item_id, status }),
  });
  if (!res.ok) throw new Error('Failed to update progress');
  return res.json(); // { success, streak, readiness_score }
}

// ── Payment ───────────────────────────────────────────────────────────────────

export async function createCheckout(token: string) {
  const res = await authFetch('/api/v1/payment/create-checkout', token, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to create checkout session');
  return res.json(); // { checkout_url }
}

export async function verifyPayment(token: string, sessionId: string) {
  const res = await authFetch(`/api/v1/payment/verify/${sessionId}`, token);
  if (!res.ok) throw new Error('Failed to verify payment');
  return res.json(); // { status, is_pro }
}
