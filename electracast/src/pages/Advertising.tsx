import ContactCard from '../components/ContactCard'
import SectionHeader from '../components/SectionHeader'

const Advertising = () => {
  return (
    <section className="section">
      <SectionHeader
        title="Advertising"
        description="Reach engaged listeners across the ElectraCast network."
      />
      <div className="account-card">
        <h3>Heard On Our Podcasts</h3>
        <img
          className="advertising-banner"
          src="https://electracast.com/wp-content/uploads/2022/03/Our-Advertisers.png"
          alt="Advertisers featured on ElectraCast podcasts"
          loading="lazy"
        />
      </div>
      <div className="account-card">
        <h3>Advertiser Inquiry</h3>
        <p>
          Tell us about your campaign and we will follow up with sponsorship and
          cross-promotional options.
        </p>
        <form className="advertising-form" onSubmit={(event) => event.preventDefault()}>
          <div className="form-grid">
            <label className="form-field" htmlFor="advertiser-company">
              Company Name
              <input id="advertiser-company" name="company" type="text" />
            </label>
            <label className="form-field" htmlFor="advertiser-first-name">
              Contact First Name
              <input id="advertiser-first-name" name="firstName" type="text" />
            </label>
            <label className="form-field" htmlFor="advertiser-last-name">
              Contact Last Name
              <input id="advertiser-last-name" name="lastName" type="text" />
            </label>
            <label className="form-field" htmlFor="advertiser-email">
              Email
              <input id="advertiser-email" name="email" type="email" />
            </label>
            <label className="form-field" htmlFor="advertiser-phone">
              Phone
              <input id="advertiser-phone" name="phone" type="tel" />
            </label>
            <label className="form-field" htmlFor="advertiser-budget">
              Approximate Budget
              <input id="advertiser-budget" name="budget" type="text" />
            </label>
            <label className="form-field" htmlFor="advertiser-start-date">
              Desired Start Date
              <input id="advertiser-start-date" name="startDate" type="text" placeholder="MM/DD/YYYY" />
            </label>
            <label className="form-field full" htmlFor="advertiser-message">
              Message / Instructions
              <textarea id="advertiser-message" name="message" rows={6} />
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

export default Advertising
