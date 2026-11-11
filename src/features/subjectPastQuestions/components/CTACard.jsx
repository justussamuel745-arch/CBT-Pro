import { Link } from 'react-router';
import { authStore } from '@/stores/authStore';
import { Reveal } from '@/components/common/Reveal';

export function CTACard({ subject, buttons }) {
  const token = authStore(state => state.token)
  
  return (
    <>
      { !token && 
          (
            <section className="home-section container">
              <Reveal className="cta">
                <h2>Start practicing { subject } past questions today</h2>
                <p>Create a free account to save your scores, track your progress and unlock the full CBT simulator.</p>
                <div className="cta-actions">
                  <Link to="/auth/signup" className="btn btn-hero">Create Free Account</Link>
                  {
                    buttons.map(btn => 
                      (
                        <a href={btn.link} className="btn btn-hero cta-ghost">{ btn.text }</a>
                      )
                    )
                  }
                </div>
              </Reveal>
            </section>
          )
        }
    </>
  )
}