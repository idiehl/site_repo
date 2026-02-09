import ContactCard from '../components/ContactCard'
import SectionHeader from '../components/SectionHeader'

const Contact = () => {
  return (
    <section className="section">
      <SectionHeader
        title="Contact"
        description="Let's build your next show together."
      />
      <div className="account-card">
        <h3>Contact ElectraCast</h3>
        <p>
          Share your project details below and the ElectraCast team will follow up.
        </p>
        <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
          <div className="form-grid">
            <label className="form-field" htmlFor="contact-first-name">
              First Name
              <input id="contact-first-name" name="firstName" type="text" />
            </label>
            <label className="form-field" htmlFor="contact-last-name">
              Last Name
              <input id="contact-last-name" name="lastName" type="text" />
            </label>
            <label className="form-field" htmlFor="contact-email">
              Email
              <input id="contact-email" name="email" type="email" />
            </label>
            <label className="form-field full" htmlFor="contact-message">
              Message
              <textarea id="contact-message" name="message" rows={6} />
            </label>
          </div>
          <div className="form-actions">
            <button className="btn primary" type="button" disabled>
              Submit (coming soon)
            </button>
            <span className="form-note">
              Submission is being wired to the intake pipeline.
            </span>
          </div>
        </form>
      </div>
      <ContactCard />
    </section>
  )
}

export default Contact
