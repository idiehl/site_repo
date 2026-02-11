import { Link } from 'react-router-dom'

const AccountCard = () => {
  return (
    <div className="account-card">
      <p>
        Access your ElectraCast dashboard to manage podcast submissions, profile details,
        and creator resources.
      </p>
      <div className="account-actions">
        <Link className="btn ghost" to="/account">
          Go to dashboard
        </Link>
        <Link className="btn ghost" to="/register">
          Create an account
        </Link>
      </div>
    </div>
  )
}

export default AccountCard
