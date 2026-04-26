const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function authFetch(
  path: string,
  token: string,
  options: RequestInit = {},
  retries = 0
): Promise<Response> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    // Retry on network errors or 5xx
    if (!response.ok && response.status >= 500 && retries < MAX_RETRIES) {
      await sleep(RETRY_DELAY * (retries + 1));
      return authFetch(path, token, options, retries + 1);
    }

    return response;
  } catch (error) {
    // Retry on network errors
    if (retries < MAX_RETRIES) {
      await sleep(RETRY_DELAY * (retries + 1));
      return authFetch(path, token, options, retries + 1);
    }
    throw error;
  }
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

export async function rescheduleDay(token: string) {
  const res = await authFetch('/api/v1/schedule/reschedule', token, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reschedule');
  return res.json();
}

export async function activateRescueMode(token: string) {
  const res = await authFetch('/api/v1/schedule/rescue-mode', token, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to activate rescue mode');
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

export async function verifyPayment(token: string, paymentId: string) {
  const res = await authFetch(`/api/v1/payment/verify/${paymentId}`, token);
  if (!res.ok) throw new Error('Failed to verify payment');
  return res.json(); // { status, is_pro }
}

// ── Reminders ─────────────────────────────────────────────────────────────────

export async function subscribeTelegram(token: string, chatId: string) {
  const res = await authFetch('/api/v1/reminders/subscribe-telegram', token, {
    method: 'POST',
    body: JSON.stringify({ chat_id: chatId }),
  });
  if (!res.ok) throw new Error('Failed to subscribe to Telegram reminders');
  return res.json();
}

export async function subscribeSMS(token: string, phoneNumber: string) {
  const res = await authFetch('/api/v1/reminders/subscribe-sms', token, {
    method: 'POST',
    body: JSON.stringify({ phone_number: phoneNumber }),
  });
  if (!res.ok) throw new Error('Failed to subscribe to SMS reminders');
  return res.json();
}

export async function unsubscribeReminders(token: string) {
  const res = await authFetch('/api/v1/reminders/unsubscribe', token, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to unsubscribe from reminders');
  return res.json();
}

