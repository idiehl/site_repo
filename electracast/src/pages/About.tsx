import FeatureGrid from '../components/FeatureGrid'
import SectionHeader from '../components/SectionHeader'

type Bio = {
  name: string
  role: string
  image: string
  bio: string
}

const team: Bio[] = [
  {
    name: 'Mark Netter',
    role: 'Founder / CEO',
    image: 'https://electracast.com/wp-content/uploads/2022/02/Mark-Netter-Director-1.jpg',
    bio: 'Mark Netter has been an entertainment advertising executive for over 17 years, most recently as Director, Creative Campaigns on the launch team for DC Universe, the fan-focused OTT streaming service from Warner Bros. Mark earned an A.B. in Semiotics at Brown University and an MFA in Film Production at New York University\'s Tisch School of the Arts. He was previously VP Strategy for Revolve and other advertising agencies, and over his career in entertainment his clients have included Warner Bros, The Walt Disney Studios, Universal Pictures, Paramount Pictures, Focus Features, NBC, CBS, Showtime, Starz, DirecTV, FX, TBS, TNT, A+E, Lifetime, E!, GSN, NFL, VH1, Ubisoft, Sega, Activision, Mattel and tech clients Intel and Adobe. He is also an award-winning independent filmmaker as Director, Co-Writer, and Producer of NIGHTMARE CODE. He is currently a member of the Entertainment Business faculty at the Los Angeles Film School, where he teaches Entertainment Marketing.',
  },
  {
    name: 'Peter Rafelson',
    role: 'Founder / President',
    image: 'https://electracast.com/wp-content/uploads/2022/02/PeterRafelson.jpg',
    bio: 'Peter Rafelson is an entertainment and business entrepreneur, platinum RIAA and ASCAP award-winning artist, writer, director, and producer active in media and technology sectors. Born in Manhattan and moved to LA at an early age as the son of iconic film producer and director Bob Rafelson (Easy Rider, Five Easy Pieces, The Monkees), Peter grew up in the heart of the movie industry before deciding to start his own career in music. Peter has written, produced, and mixed over thirty number one hit songs for artists like Ty$, Stevie Wonder, Elton John, Britney Spears and written iconic hits including Open Your Heart for Madonna. Peter was a staff producer for Warner Bros. Records and EMI Music Group before starting Rafelson Media in North Hollywood. In addition to being a founder of five publishing companies, a luxury lifestyle brand, and three content labels, he is also renowned for writing, producing, and directing stage musicals, films, and music videos. Rafelson Media currently consults to many entertainment and tech companies and partners with a number of international companies, including Chinese-based EDI Media and Golden Dragon Entertainment, developing new businesses in both the US and China.',
  },
]

const advisors: Bio[] = [
  {
    name: 'Josh Gutfreund',
    role: 'Partner and Strategic Advisor',
    image: 'https://electracast.com/wp-content/uploads/2022/02/Josh-Gutfreund.jpg',
    bio: 'Josh is an experienced corporate development, private equity, and financial executive focused on media businesses. Active in strategy, M&A, board roles, film finance, growth equity and venture investments, and operational and interim CFO duties. Clarity Partners, Tang Media, BASE Entertainment, Oxygen Media, Village Roadshow Entertainment Group, Concord Music.',
  },
  {
    name: 'Sara Mascall',
    role: 'Head of Revenue and Strategy',
    image: 'https://electracast.com/wp-content/uploads/2024/02/Sara-Mascal-Headshot-_-BW.jpg',
    bio: 'Sara has held key roles in prominent organizations, most recently as the Senior Vice President of the Technology, Media, and Telco sector at The Wall Street Journal | Barron\'s Group, a division of News Corp. With extensive expertise in strategy, operational processes, and achieving overarching business objectives, she has successfully collaborated with international companies and played a pivotal role in establishing partnerships that connect cultural nuances with business imperatives. At ElectraCast she spearheads Revenue Operations and Strategy while concurrently serving on the Advisory Board.',
  },
  {
    name: 'David Castor',
    role: 'Board Advisor',
    image: 'https://electracast.com/wp-content/uploads/2022/02/David-A-Castor.jpg',
    bio: 'David founded Alerding Castor Hewitt, LLP in 2007 where, in addition to general services, he counsels entrepreneurs through business modeling, capital strategies, securities transactions, sales, and growth initiatives. He works with technology and high growth-stage companies, private equity, and angel investment groups worldwide. He is also an adjunct professor at Purdue University and Butler University.',
  },
  {
    name: 'Joseph Dimuro',
    role: 'Strategic Business Advisor',
    image: 'https://electracast.com/wp-content/uploads/2022/02/Joseph-Dimuro.jpg',
    bio: 'Strategic Business Advisor Joe has generated over $2B in product, content, and brand media revenue in senior executive positions at News Corp, Sony Music, BMG, and IPG, with creatives such as Beyonce, Justin Timberlake, U2, Pharrell Williams, Gwen Stefani, Alicia Keys, and Jay-Z. As a brand and lifestyle IP entrepreneur focusing on Gen-Z and Millennials, he has generated over $500M for partners and clients.',
  },
  {
    name: 'Kerry Gordy',
    role: 'Strategic Partnerships Advisor',
    image: 'https://electracast.com/wp-content/uploads/2022/02/Kerry-Gordy.jpg',
    bio: 'Kerry is an entertainment industry executive and son of Motown Records founder Berry Gordy. He was EP at Motown, head of Prince\'s Paisley Park label, VP of Warner Bros. Records, and pioneered the US Copyright Termination and Recapture business. Kerry is an IP expert working on international business ventures, development, and brand licensing as co-founder of Golden Dragon Media Group.',
  },
]

const About = () => {
  return (
    <section className="section">
      <SectionHeader
        title="About ElectraCast"
        description="We inspire and connect people through compelling entertainment and story."
      />
      <div className="account-card">
        <h3>We inspire and connect people through compelling entertainment and story.</h3>
        <p>
          ElectraCast is a new 360-degree content company focused on inspiring and
          connecting people, creating a better world through compelling
          entertainment and storytelling. ElectraCast develops content along
          multiple verticals and mediums, spinning off hit podcasts into film and
          television adaptations, promoting new and emerging recording artists
          through ElectraCast Music, and creating engaging narratives that unite
          entertainment partnerships with social impact goals. Our mission is to
          become the go-to partner for creatives in any medium to tell compelling
          stories in a daring new way.
        </p>
      </div>
      <FeatureGrid />
      <div className="resource-grid">
        <div className="account-card">
          <h3>ElectraCast Team</h3>
          <div className="bio-grid">
            {team.map((member) => (
              <article className="bio-card" key={member.name}>
                <img
                  className="bio-photo"
                  src={member.image}
                  alt={`${member.name} headshot`}
                  loading="lazy"
                />
                <div>
                  <h4 className="bio-name">{member.name}</h4>
                  <p className="bio-role">{member.role}</p>
                  <p className="bio-text">{member.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="account-card">
          <h3>ElectraCast Advisors</h3>
          <div className="bio-grid">
            {advisors.map((member) => (
              <article className="bio-card" key={member.name}>
                <img
                  className="bio-photo"
                  src={member.image}
                  alt={`${member.name} headshot`}
                  loading="lazy"
                />
                <div>
                  <h4 className="bio-name">{member.name}</h4>
                  <p className="bio-role">{member.role}</p>
                  <p className="bio-text">{member.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
