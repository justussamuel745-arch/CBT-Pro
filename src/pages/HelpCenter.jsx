import { useState } from "react";
import { Link } from "react-router";
import './HelpCenter.css';

const categories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "fa-solid fa-rocket",
    colorVar: "--c-getting-started",
    description: "New here? Start with account setup and finding your way around.",
    items: [
      {
        q: "What is CBT Pro?",
        a: "CBT Pro is a Nigeria-based CBT platform built for students preparing for the upcoming JAMB examination. It gives you a proper study environment with Study Mode, Practice Mode, an AI Assistant, and the ability to schedule a personal exam for a specific date with a target score to aim for and beat.",
      },
      {
        q: "How do I create an account?",
        a: "Tap <strong>Sign Up</strong> and enter your full name, email, phone number and a password, or continue with Google. You can start studying right away — there's no waiting period.",
      },
      {
        q: "How do I sign in?",
        a: "Enter the email and password you registered with, or use \"Continue with Google\" if that's how you signed up.",
      },
      {
        q: "How do I choose a subject, year, or topic?",
        a: "Inside Study Mode, select a subject first, then configure which year(s) and topic(s) you want questions from. This lets you drill a single weak topic or mix several years together.",
      },
      {
        q: "How do I use the exam syllabus?",
        a: "Every subject has a Syllabus tab listing the official JAMB topics for that subject, so you know exactly what to cover before picking your topics in Study Mode.",
      },
      {
        q: "What can the AI Assistant help with?",
        a: "The AI Assistant (AstraAI) can explain a topic in more depth, break down a question you're stuck on, or answer general JAMB-prep questions — available any time from the chat icon.",
      },
    ],
  },
  {
    id: "study-practice",
    title: "Study & Practice",
    icon: "fa-solid fa-book-open",
    colorVar: "--c-study-practice",
    description: "How Study Mode and Practice Mode work, and how to track your progress.",
    items: [
      {
        q: "What's the difference between Study Mode and Practice Mode?",
        a: "In Study Mode, you pick a subject and configure the year(s) and topic(s) you want. For every question you answer, CBT Pro immediately tells you if you're correct and gives a detailed explanation — it's built for learning as you go. Practice Mode simulates the exact JAMB exam experience instead: it runs on a timer, auto-submits the moment time runs out, and holds back feedback until you're done, so you can test yourself under real conditions.",
      },
      {
        q: "Can I switch into Practice Mode from Study Mode?",
        a: "Yes — you can trigger a full timed Practice Mode simulation at any time while studying, using whichever subject, years, and topics you've configured.",
      },
      {
        q: "How does the timer and auto-submit work in Practice Mode?",
        a: "Once you start, a countdown runs for the whole session. If time runs out before you submit, CBT Pro auto-submits automatically with whatever answers you've selected so far — nothing is lost.",
      },
      {
        q: "How do I review my answers after Practice Mode?",
        a: "After submitting, open Review to go through every question you answered, see whether it was correct, and read the full explanation for each one.",
      },
      {
        q: "How do I bookmark a question?",
        a: "Tap the bookmark icon on any question while studying or reviewing. Bookmarked questions are saved to your Bookmarks list so you can come back and drill them later.",
      },
      {
        q: "Where can I see my test history?",
        a: "Your Test History page lists every past Practice Mode session with your score and date, so you can track how your performance is trending over time.",
      },
      {
        q: "Can I search past questions directly?",
        a: "Yes — use the search feature inside a subject to find past questions by keyword, instead of browsing year by year.",
      },
    ],
  },
  {
    id: "exam-scheduling",
    title: "Exam Scheduling",
    icon: "fa-solid fa-calendar-check",
    colorVar: "--c-exam-scheduling",
    description: "Plan a personal mock exam around a date and a score you're aiming to beat.",
    items: [
      {
        q: "What is exam scheduling?",
        a: "Exam scheduling lets you plan a personal mock exam for a specific date in the future, so you can build a study plan around it instead of practicing at random.",
      },
      {
        q: "How do I schedule a personal exam?",
        a: "From your dashboard, choose <strong>Schedule Exam</strong>, pick a date, set the subjects you want included and provide and fill every required field. CBT Pro will remind you as the date approaches.",
      },
      {
        q: "What is a target score, and how do I set one?",
        a: "When you schedule an exam, you can set a target score you're aiming to beat. It's there to give you something concrete to work toward, not just a pass mark.",
      },
      {
        q: "What happens after my scheduled exam?",
        a: "You'll see your result against the target score you set, so you know immediately whether you beat it. Keep an eye out for upcoming features that build on scheduled exams and target scores.",
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    icon: "fa-solid fa-user",
    colorVar: "--c-account",
    description: "Manage your profile, password, and account settings.",
    items: [
      {
        q: "How do I update my profile?",
        a: "Go to Settings → Profile to change your name, profile picture, or school. If you signed up with Google, your picture syncs from your Google account automatically.",
      },
      {
        q: "How do I change my password?",
        a: "Go to Settings → Security and choose <strong>Change Password</strong>. This isn't available if you signed up with Google — sign in there instead.",
      },
      {
        q: "What do I do if I forget my password?",
        a: "On the sign-in screen, tap <strong>Forgot Password</strong> and enter your email. A reset link will be sent to you — it's valid for a limited time.",
      },
      {
        q: "How do I manage my account settings?",
        a: "All settings — profile, security, and notifications — live under Settings, accessible from the menu once you're signed in.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings → Security → Delete Account. This permanently removes your account and progress and can't be undone.",
      },
    ],
  },
  {
    id: "activation",
    title: "Activation & Payment",
    icon: "fa-solid fa-crown",
    colorVar: "--c-activation",
    description: "Pricing, what activation unlocks, and paying securely with Paystack.",
    items: [
      {
        q: "How much does activation cost?",
        a: "Activation is ₦1,500 per year. This fee may be updated in the future, but you'll always see the current price before you pay.",
      },
      {
        q: "What does an activated account get me?",
        a: "An activated account has no access limits — every subject, every feature — and is completely ad-free for the full year.",
      },
      {
        q: "How do I activate my account?",
        a: "Go to the Activation page and pay securely through Paystack using a card, bank transfer, or USSD. Your account activates automatically the moment payment is confirmed.",
      },
      {
        q: "Is paying with Paystack safe?",
        a: "Yes. Paystack is a licensed, PCI-DSS compliant payment processor used across Africa — your card details are encrypted and handled entirely by Paystack. CBT Pro never sees or stores your card number.",
      },
      {
        q: "What happens when my activation expires?",
        a: "Since activation is an annual payment, you'll be prompted to renew after a year. Renew any time from the Activation page to keep uninterrupted, ad-free access.",
      },
      {
        q: "I paid but my account wasn't activated — what do I do?",
        a: "This is usually a short delay while Paystack confirms the payment — check back in a few minutes. If it's still not reflected, contact support with your payment reference and we'll sort it out.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: "fa-solid fa-screwdriver-wrench",
    colorVar: "--c-troubleshooting",
    description: "Fixes for common issues with exams, loading, and login.",
    items: [
      {
        q: "Questions aren't loading",
        a: "Check your internet connection, then refresh the page. If it persists, sign out and back in to clear any stale session data.",
      },
      {
        q: "My exam won't start",
        a: "Make sure you don't already have another exam in progress — only one can run at a time. Refresh and try again, or try a different browser.",
      },
      {
        q: "My exam was interrupted",
        a: "Your progress will be lost if you close the app during an exam. Please make sure to submit your work before exiting.",
      },
      {
        q: "My progress isn't being saved",
        a: "Progress saves automatically and get displayed immediately but needs an internet connection to sync to the server.",
      },
      {
        q: "The website is loading slowly",
        a: "Try a stronger network connection and clear your browser cache. If you installed CBT Pro as an app, reopen it to trigger any pending update.",
      },
      {
        q: "I'm having trouble logging in",
        a: "Double-check your email, password, and Caps Lock. If you signed up with Google, use \"Continue with Google\" instead of a password.",
      },
      {
        q: "Can I use this application without internet connection?",
        a: "Yes, you can use the application offline. Your history, test progress, and other relevant data will automatically sync once you reconnect to the internet."
      }
    ],
  },
  {
    id: "privacy",
    title: "Privacy & Security",
    icon: "fa-solid fa-shield-halved",
    colorVar: "--c-privacy",
    description: "How your data is handled, and how payments stay secure.",
    items: [
      {
        q: "How does CBT Pro handle my account information?",
        a: "We store only what's needed to run your account — your profile, study history, and payment records for activation. Your data is never sold.",
      },
      {
        q: "How secure is paying through Paystack?",
        a: "Paystack is PCI-DSS compliant and licensed to process payments securely — it encrypts your card details end to end, and CBT Pro never sees or stores them directly.",
      },
      {
        q: "How do I keep my account secure?",
        a: "Use a strong, unique password and don't share your login. If you signed up with Google, keep that account secured too, since it controls access to CBT Pro.",
      },
      {
        q: "Where can I read the Privacy Policy?",
        a: 'You can read the full Privacy Policy <a href="/legal?tab=privacy">here</a>.',
      },
      {
        q: "Where can I read the Terms of Service?",
        a: 'You can read the full Terms of Service <a href="/legal">here</a>.',
      },
    ],
  },
];

function getCategory(id) {
  return categories.find((c) => c.id === id);
}

function snippet(html, len) {
  const plain = html.replace(/<[^>]+>/g, "");
  return plain.length > len ? plain.slice(0, len).trim() + "…" : plain;
}

export default function HelpCenter() {
  const [view, setView] = useState("category"); // "category" | "article" | "search"
  const [catId, setCatId] = useState(categories[0].id);
  const [itemIdx, setItemIdx] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const activeCategory = getCategory(catId);

  function goToCategory(id) {
    setSearchTerm("");
    setView("category");
    setCatId(id);
    setItemIdx(null);
  }

  function openItem(id, idx) {
    setView("article");
    setCatId(id);
    setItemIdx(idx);
  }

  function closeArticle() {
    setView("category");
    setItemIdx(null);
  }

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearchTerm(value);
    setView(value.trim() ? "search" : "category");
    setItemIdx(null);
  }

  const searchResults =
    view === "search"
      ? categories.flatMap((cat) =>
          cat.items
            .map((item, idx) => ({ cat, idx, item }))
            .filter(
              ({ item }) =>
                item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.a.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
      : [];

  return (
    <div className="help-page">
      <nav className="help-nav">
        <div className="help-container">
          <div className="help-nav-content">
            <Link to="/" className="help-logo">CBT Pro</Link>
            <span className="help-nav-crumb">
              <strong>Help Center</strong>
              {view !== "category" || catId !== categories[0].id ? (
                <> / {view === "search" ? "Search" : activeCategory.title}</>
              ) : (
                <> / {activeCategory.title}</>
              )}
            </span>
          </div>
        </div>
      </nav>

      <header className="help-hero">
        <div className="help-container">
          <h1>How can we help?</h1>
          <p>Answers to common questions about studying, activation, and your account.</p>
          <div className="help-search">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder='Search for an answer, e.g. "target score" or "Paystack"'
              autoComplete="off"
            />
          </div>
        </div>
      </header>

      <div className="help-container">
        <div className="help-layout">
          <aside className="help-sidebar">
            <div className="help-sidebar-select">
              <select
                value={catId}
                onChange={(e) => goToCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="help-sidebar-nav">
              <div className="help-sidebar-label">CATEGORIES</div>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={
                    "help-nav-item" +
                    (cat.id === catId && view !== "search" ? " active" : "")
                  }
                  style={{ "--item-color": `var(${cat.colorVar})` }}
                  onClick={() => goToCategory(cat.id)}
                >
                  <span className="help-nav-icon">
                    <i className={cat.icon} />
                  </span>
                  {cat.title}
                  <span className="help-nav-count">{cat.items.length}</span>
                </button>
              ))}
            </div>

            <div className="help-sidebar-contact">
              <h3>Still stuck?</h3>
              <p>Can't find what you're looking for? Send us a message and we'll get back to you.</p>
              <a
                className="help-mail-btn"
                href="mailto:teamcbtpro@gmail.com"
              >
                <i className="fa-solid fa-envelope" /> Email Support
              </a>
            </div>
          </aside>

          <main className="help-main">
            {view === "search" && (
              <>
                {searchResults.length === 0 ? (
                  <div className="help-empty">
                    <i className="fa-solid fa-magnifying-glass" />
                    <p>No results for "{searchTerm}". Try a different term, or email support.</p>
                  </div>
                ) : (
                  <>
                    <div className="help-section-head">
                      <h2>
                        {searchResults.length} result
                        {searchResults.length !== 1 ? "s" : ""}
                      </h2>
                    </div>
                    <div className="help-grid">
                      {searchResults.map(({ cat, idx, item }) => (
                        <button
                          key={cat.id + idx}
                          className="help-card"
                          style={{ "--card-color": `var(${cat.colorVar})` }}
                          onClick={() => openItem(cat.id, idx)}
                        >
                          <span className="help-card-tag">{cat.title}</span>
                          <div className="help-card-q">{item.q}</div>
                          <div className="help-card-snippet">{snippet(item.a, 90)}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {view === "category" && (
              <>
                <div className="help-section-head">
                  <div
                    className="help-eyebrow"
                    style={{ "--head-color": `var(${activeCategory.colorVar})` }}
                  >
                    <i className={activeCategory.icon} /> {activeCategory.title}
                  </div>
                  <h2>{activeCategory.title}</h2>
                  <p>{activeCategory.description}</p>
                </div>
                <div className="help-grid">
                  {activeCategory.items.map((item, idx) => (
                    <button
                      key={idx}
                      className="help-card"
                      style={{ "--card-color": `var(${activeCategory.colorVar})` }}
                      onClick={() => openItem(activeCategory.id, idx)}
                    >
                      <div className="help-card-q">
                        {item.q} <i className="fa-solid fa-arrow-right" />
                      </div>
                      <div className="help-card-snippet">{snippet(item.a, 90)}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {view === "article" && itemIdx !== null && (
              <>
                <div className="help-breadcrumb">
                  <button onClick={() => goToCategory(activeCategory.id)}>
                    ← {activeCategory.title}
                  </button>
                </div>
                <div
                  className="help-article"
                  style={{ "--art-color": `var(${activeCategory.colorVar})` }}
                >
                  <div className="help-article-bar" />
                  <div className="help-article-body">
                    <button
                      className="help-article-close"
                      onClick={closeArticle}
                      aria-label="Close"
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                    <div className="help-eyebrow">
                      <i className={activeCategory.icon} /> {activeCategory.title}
                    </div>
                    <h2>{activeCategory.items[itemIdx].q}</h2>
                    <div
                      className="help-answer"
                      dangerouslySetInnerHTML={{ __html: activeCategory.items[itemIdx].a }}
                    />
                    {activeCategory.items.length > 1 && (
                      <div className="help-related">
                        <h3>MORE IN {activeCategory.title.toUpperCase()}</h3>
                        {activeCategory.items.map((it, idx) =>
                          idx === itemIdx ? null : (
                            <div
                              key={idx}
                              className="help-related-item"
                              onClick={() => openItem(activeCategory.id, idx)}
                            >
                              {it.q} <i className="fa-solid fa-arrow-right" />
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <footer className="help-footer">
        © 2026 CBT Pro. JAMB UTME preparation for Nigerian students.
      </footer>
    </div>
  );
}
