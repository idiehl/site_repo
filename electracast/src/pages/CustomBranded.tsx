import SectionHeader from '../components/SectionHeader'

const CustomBranded = () => {
  return (
    <section className="section">
      <SectionHeader
        title="Custom Branded Podcasts"
        description="Strategy, storytelling, and production for brands ready to launch signature audio experiences."
      />
      <div className="account-card">
        <h3>Get in touch</h3>
        <p>
          <a href="#custom-branded-contact">
            Please click here to use the contact form below.
          </a>
        </p>
        <p>Listen to the ECM Production Demo Reel:</p>
        <div className="demo-reel">
          <audio controls preload="none">
            <source
              type="audio/mpeg"
              src="https://electracast.com/wp-content/uploads/2024/06/ECM-Promo-Demo-Reel-Q2-2024-1.mp3"
            />
          </audio>
          <a
            className="btn ghost"
            href="https://electracast.com/wp-content/uploads/2024/06/ECM-Promo-Demo-Reel-Q2-2024-1.mp3"
            target="_blank"
            rel="noreferrer"
          >
            Open audio
          </a>
        </div>
      </div>
      <div id="custom-branded-contact" className="account-card">
        <h3>Contact - ECM Custom Podcasts</h3>
        <p>Contact us for more information.</p>
        <form className="contact-form">
          <div className="form-grid">
            <label className="form-field">
              <span>First Name</span>
              <input type="text" name="firstName" placeholder="First" />
            </label>
            <label className="form-field">
              <span>Last Name</span>
              <input type="text" name="lastName" placeholder="Last" />
            </label>
            <label className="form-field full">
              <span>Email</span>
              <input type="email" name="email" placeholder="you@company.com" />
            </label>
            <label className="form-field full">
              <span>Phone</span>
              <input type="tel" name="phone" placeholder="(555) 123-4567" />
            </label>
            <label className="form-field full">
              <span>Message</span>
              <textarea
                name="message"
                rows={6}
                placeholder="Tell us about your show goals, timeline, and audience."
              />
            </label>
          </div>
          <div className="form-actions">
            <button className="btn" type="button" disabled>
              Submit (coming soon)
            </button>
            <span className="form-note">
              Form submissions will be wired to the intake pipeline.
            </span>
          </div>
        </form>
      </div>
    </section>
  )
}

export default CustomBranded
