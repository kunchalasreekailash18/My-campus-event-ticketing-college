const API_BASE = '/api';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Server request failed');
  }
  return data;
}

// Authentication
export async function studentRegister(data) {
  const res = await fetch(`${API_BASE}/auth/student/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function studentLogin(data) {
  const res = await fetch(`${API_BASE}/auth/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function coordinatorLogin(data) {
  const res = await fetch(`${API_BASE}/auth/coordinator/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

// Events
export async function getEvents(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters.search) params.append('search', filters.search);
  if (filters.include_expired) params.append('include_expired', filters.include_expired);
  const res = await fetch(`${API_BASE}/events?${params.toString()}`);
  return handleResponse(res);
}

export async function getEventById(id) {
  const res = await fetch(`${API_BASE}/events/${id}`);
  return handleResponse(res);
}

export async function createEvent(eventData) {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  });
  return handleResponse(res);
}

export async function cancelEvent(eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  return handleResponse(res);
}


// Tickets & Registration
export async function bookTicket(bookingData) {
  const res = await fetch(`${API_BASE}/tickets/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  });
  return handleResponse(res);
}

export async function getMyTickets(query = {}) {
  const params = new URLSearchParams();
  if (query.email) params.append('email', query.email);
  if (query.roll_no) params.append('roll_no', query.roll_no);
  if (query.user_id) params.append('user_id', query.user_id);
  const res = await fetch(`${API_BASE}/tickets/my?${params.toString()}`);
  return handleResponse(res);
}

export async function verifyTicket(ticketCode) {
  const res = await fetch(`${API_BASE}/tickets/verify/${encodeURIComponent(ticketCode)}`);
  return handleResponse(res);
}

export async function checkInTicket(ticketCode) {
  const res = await fetch(`${API_BASE}/tickets/checkin/${encodeURIComponent(ticketCode)}`, {
    method: 'POST'
  });
  return handleResponse(res);
}

// OpenMind Campus Mind Posts
export async function getOpenMindPosts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.search) params.append('search', filters.search);
  const res = await fetch(`${API_BASE}/openmind/posts?${params.toString()}`);
  return handleResponse(res);
}

export async function createPost(postData) {
  const res = await fetch(`${API_BASE}/openmind/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });
  return handleResponse(res);
}

export async function upvotePost(postId) {
  const res = await fetch(`${API_BASE}/openmind/posts/${postId}/upvote`, {
    method: 'POST'
  });
  return handleResponse(res);
}

export async function reactToPost(postId, reactionType) {
  const res = await fetch(`${API_BASE}/openmind/posts/${postId}/react`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reaction_type: reactionType })
  });
  return handleResponse(res);
}

export async function addComment(postId, commentData) {
  const res = await fetch(`${API_BASE}/openmind/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commentData)
  });
  return handleResponse(res);
}

// Overview stats
export async function getPlatformStats() {
  const res = await fetch(`${API_BASE}/stats/overview`);
  return handleResponse(res);
}
