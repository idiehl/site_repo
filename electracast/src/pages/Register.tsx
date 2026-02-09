import SectionHeader from '../components/SectionHeader'

const Register = () => {
  return (
    <section className="section">
      <SectionHeader
        title="Register"
        description="Welcome to ElectraCast. Join the community and start podcasting."
      />
      <div className="account-card">
        <p>
          <strong>Welcome to ElectraCast.</strong>
        </p>
        <ul className="resource-list">
          <li>We invite you to become a valued member of our community.</li>
          <li>
            Sign up for free, gain access to your own dashboard and start
            podcasting.
          </li>
        </ul>
        <p>
          Already a member? <a href="/account">Log in</a>.
        </p>
      </div>
      <div className="account-card">
        <h3>Create your account</h3>
        <form className="contact-form">
          <div className="form-grid">
            <label className="form-field">
              <span>First Name</span>
              <input type="text" name="firstName" />
            </label>
            <label className="form-field">
              <span>Last Name</span>
              <input type="text" name="lastName" />
            </label>
            <label className="form-field full">
              <span>Username</span>
              <input type="text" name="username" />
            </label>
            <label className="form-field full">
              <span>Email</span>
              <input type="email" name="email" />
            </label>
            <label className="form-field full">
              <span>Password</span>
              <input type="password" name="password" />
            </label>
            <label className="form-field full">
              <span>Confirm Password</span>
              <input type="password" name="confirmPassword" />
            </label>
          </div>
          <div className="form-actions">
            <button className="btn" type="button" disabled>
              Join ElectraCast (coming soon)
            </button>
            <span className="form-note">
              Account creation will be enabled once backend auth is wired.
            </span>
          </div>
        </form>
      </div>
    </section>
  )
}

export default Register
