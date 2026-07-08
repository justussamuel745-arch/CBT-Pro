import { useState, useEffect, useRef, memo } from 'react';
import { Link } from 'react-router';
import './Menu.css';

export const Menu = memo(function Menu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="menu">
      <button
        className={`menu-btn ${menuOpen ? "active" : ""}`}
        id="menuBtn"
        ref={menuBtnRef}
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
      >
        <i className="fas fa-bars"></i>
      </button>
      <div
        className={`menu-dropdown ${menuOpen ? "show" : ""}`}
        id="menuDropdown"
        ref={menuRef}
      >
        <div className="menu-section">
          <div className="menu-section-title"><i className="fas fa-bullseye"></i> PRACTICE</div>
          <Link to="/simulator"><i className="fas fa-desktop"></i> CBT Simulator</Link>
          <Link to="/study"><i className="fas fa-book-open"></i> Study Past Questions</Link>
        </div>

        <div className="menu-divider"></div>

        <div className="menu-section">
          <div className="menu-section-title"><i className="fas fa-tools"></i> Study Tools</div>
          <Link to="/syllabus"><i className="fas fa-file-alt"></i> JAMB Syllabus 2027</Link>
        </div>

        <div className="menu-divider"></div>

        <div className="menu-section">
          <div className="menu-section-title"><i className="fas fa-user"></i> MY ACCOUNT</div>
          <Link to="/history"><i className="fas fa-clock-rotate-left"></i> Test History</Link>
          <Link to="/bookmark"><i className="fas fa-bookmark"></i> Bookmarked Questions</Link>
        </div>

        <div className="menu-divider"></div>

        <div className="menu-section">
          <div className="menu-section-title"><i className="fas fa-unlock"></i> SUBSCRIPTION</div>
          <Link to="/payment"><i className="fas fa-crown"></i> Unlock Full Access</Link>
        </div>

        <div className="menu-divider"></div>

        <div className="menu-section">
          <div className="menu-section-title"><i className="fas fa-gear"></i> MANAGE ACCOUNT</div>
          <Link to="/settings"><i className="fas fa-user-gear"></i> Manage Account</Link>
        </div>

        <div className="menu-divider"></div>

        <div className="menu-section">
          <div className="menu-section-title"><i className="fas fa-circle-info"></i> SUPPORT</div>
          <Link to="/feedback"><i className="fas fa-comment-dots"></i> Feedback</Link>
          <Link to="/about"><i className="fas fa-circle-info"></i> About</Link>
        </div>
      </div>
    </div>
  )
})