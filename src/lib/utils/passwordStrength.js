export function passwordStrength(pw) {
    if (!pw) return { score: 0, label: "", color: "transparent", pct: 0 };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { label: "Too short", color: "#dc2626", pct: 15 },
      { label: "Weak", color: "#dc2626", pct: 25 },
      { label: "Fair", color: "#d97706", pct: 50 },
      { label: "Good", color: "#2563eb", pct: 70 },
      { label: "Strong", color: "#16a34a", pct: 90 },
      { label: "Very strong", color: "#16a34a", pct: 100 },
    ];
    return { score,...levels[Math.min(score, 5)] };
  }